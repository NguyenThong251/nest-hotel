export class UserResponseDto {
  id: number;
  email: string;
  access_token?: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
