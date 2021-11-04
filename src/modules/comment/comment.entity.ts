import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsBoolean, IsDate, IsString } from "class-validator";
import { Document, ObjectId, Schema as MongoSchema } from "mongoose";
import { Tweet, TweetDocument } from "../tweet/tweet.entity";
import { User, USER_MODEL } from "../user/user.entity";

export const COMMENT_MODEL = 'comments';

@Schema()
export class Comment {
    @IsString()
    @Prop(String)
    content: string;

    @IsDate()
    @Prop(Date)
    createdAt: Date;

    @IsDate()
    @Prop(Date)
    modifiedAt: Date;

    @IsBoolean()
    @Prop(Boolean)
    isEdited: boolean;

    @IsString()
    @Prop(String)
    media: string;

    @Prop({
        type: MongoSchema.Types.ObjectId,
        ref: Tweet.name
    })
    tweet: TweetDocument;

    // author prop refs to a User
    @Prop({
        type: MongoSchema.Types.ObjectId,
        ref: User.name
    })
    author: User;

    @Prop({
        type: MongoSchema.Types.ObjectId,
        ref: User.name
    })
    likes: User[];

    @Prop({ type: [{ type: MongoSchema.Types.ObjectId, ref: Comment.name }] })
    replies: Comment[];

    @Prop(Boolean)
    isChild: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

export interface CommentDocument extends Comment, Document { };