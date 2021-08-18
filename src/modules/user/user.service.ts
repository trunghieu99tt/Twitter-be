import { BadRequestException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';

// tool
import { QueryOption } from 'src/tools/request.tool';

// entity
import { User, UserDocument } from './user.entity';

// repository
import { UserRepository } from './user.repository';

// dto
import { UpdateUserDTO } from './dto/updateUser.dto';

// constants
import { MSG } from 'src/config/constants';
import { UserDTO } from './dto/user.dto';
import { MongoError } from 'mongodb';


@Injectable()
export class UserService {

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private readonly userRepository: UserRepository) { }

    async validateUsernameOrEmail(username: string): Promise<boolean> {
        return (
            /^[A-Za-z0-9._-]{4,64}$/g.test(username) || // username
            /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/g.test(
                username,
            )
        ); // email
    }

    async findAll(option: QueryOption, conditions: any = {}): Promise<UserDocument[]> {
        return this.userRepository.findAll(option, conditions);
    }

    async findById(id: string): Promise<UserDocument> {
        return this.userRepository.findById(id);
    }

    async findByUsernameOrEmail(usernameOrEmail: string): Promise<UserDocument> {
        return this.userRepository.findByUsernameOrEmail(usernameOrEmail);
    }

    async createUser(user: Partial<User>): Promise<UserDocument> {

        const validateUsernameOrEmail = await this.validateUsernameOrEmail(user.username);

        if (!validateUsernameOrEmail) {
            throw new BadRequestException(UserService.name, MSG.FRONTEND.INVALID_USERNAME);
        }

        const createdUser = new this.userModel(user);

        if (!createdUser.checkPasswordConfirm()) {
            throw new BadRequestException("Password and confirm password are not equal");
        }

        try {
            await createdUser.save();
            return createdUser;
        } catch (error) {
            throw new BadRequestException(error);
        }

    }

    async updateUser(username: string, newUserInfo: UpdateUserDTO): Promise<UserDocument> {

        const user = await this.findByUsernameOrEmail(username);

        if (!user) {
            throw new BadRequestException(UserService.name, "User not found");
        }

        if (newUserInfo.password) {
            newUserInfo.password = await bcrypt.hash(newUserInfo.password, 10);
        }

        Object.assign(user, newUserInfo);

        return user
            .save()
            .then((result: UserDocument) => {
                result.password = undefined;
                return result;
            })
            .catch((err: MongoError) => {
                throw new BadRequestException(err);
            });
    }

    async findByGoogleId(id: string): Promise<UserDocument> {
        return this.userModel.findOne({
            "google.id": id
        }).exec();
    }

    async followUser(user: UserDocument, userToFollowId: string) {
        const userToFollow = await this.findById(userToFollowId);
        if (user.following.includes(userToFollow)) {
            throw new BadRequestException(UserService.name, "You're already following this user");
        }
        user.following.push(userToFollow);
        user.passwordConfirm = '';
        await user.save();
    }
}
