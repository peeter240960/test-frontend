import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { PrismaClient, User } from '@prisma/client';
import { JWT_SECRET_KEY } from '@config';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { isEmpty } from '@utils/util';

class AuthService {
  public users = new PrismaClient().user;

  public async signup(userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

    const findUser: User = await this.users.findUnique({ where: { username: userData.username } });
    if (findUser) throw new HttpException(409, `This username ${userData.username} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: Promise<User> = this.users.create({ data: { ...userData, password: hashedPassword } });

    return createUserData;
  }

  public async login(userData: CreateUserDto) {
    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

    const findUser: User = await this.users.findUnique({ where: { username: userData.username } });
    if (!findUser) throw new HttpException(409, `This username ${userData.username} was not found`);

    const isPasswordMatching: boolean = await compare(userData.password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(409, 'Password is not matching');

    const tokenData = this.createToken({ ...findUser, password: undefined });
    const refreshToken = this.createToken({ ...findUser, password: undefined }, 60 * 60 * 60 * 12);
    const cookie = this.createCookie(tokenData);

    return { cookie, findUser, accessToken: tokenData.token, refreshToken: refreshToken.token };
  }

  public async logout(userData: User): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

    const findUser: User = await this.users.findFirst({ where: { username: userData.username, password: userData.password } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser;
  }

  public createToken(user: User, expiresIn: number = 60 * 60 * 15): TokenData {
    const dataStoredInToken: DataStoredInToken = { id: user.id };
    const secretKey: string = JWT_SECRET_KEY;

    return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  public createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }
}

export default AuthService;
