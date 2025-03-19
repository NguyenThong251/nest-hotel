import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, password } = createUserDto;
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new UnauthorizedException('Email đã tồn tại');
    }

    const user = this.usersRepository.create({ email, password });
    const savedUser = await this.usersRepository.save(user);

    // Tạo token xác thực
    const verificationToken = this.jwtService.sign(
      { email: savedUser.email, sub: savedUser.id },
      { expiresIn: '1h' },
    );

    // Gửi email xác thực
    const verificationLink = `http://localhost:3001/user/verify?token=${verificationToken}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Xác thực tài khoản Hotel App',
      template: 'verify-email',
      context: {
        email,
        verificationLink,
      },
    });
    return new UserResponseDto({ id: savedUser.id, email: savedUser.email });
  }

  async validateUser(loginUserDto: LoginUserDto): Promise<User | null> {
    const { email, password } = loginUserDto;
    const user = await this.usersRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(user: User): Promise<UserResponseDto> {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);
    return new UserResponseDto({
      id: user.id,
      email: user.email,
      access_token,
    });
  }

  async verifyUser(token: string): Promise<UserResponseDto> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersRepository.findOne({
        where: { email: payload.email },
      });
      if (!user) {
        throw new BadRequestException('User không tồn tại');
      }
      if (user.isVerified) {
        throw new BadRequestException('Tài khoản đã được xác thực');
      }
      user.isVerified = true;
      const updatedUser = await this.usersRepository.save(user);
      return new UserResponseDto({
        id: updatedUser.id,
        email: updatedUser.email,
      });
    } catch (error) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}
