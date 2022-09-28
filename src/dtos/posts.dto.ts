import { Post } from '@prisma/client';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePostDto implements Post {
  id: number;
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  readBy: number[];
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  likedBy: number[];
  ownerId: number;
  @IsNotEmpty()
  @IsString()
  message: string;
  createdAt: Date;
}
