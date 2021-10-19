import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { EAudience } from "src/config/constants";

export class StoryDTO {
    @IsString()
    content: string;

    @ApiProperty()
    audience: EAudience;
}