import { User } from '@prisma/client';
import { IsString } from 'class-validator';

export class CreateUserDto implements User {
  public id: number;
  @IsString()
  public name: string;
  @IsString()
  public lastname: string;
  @IsString()
  public username: string;
  @IsString()
  public password: string;
}
