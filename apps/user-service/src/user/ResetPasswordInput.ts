import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

class ResetPasswordInput {
    @ApiProperty({
        required: true,
        type: () => String
    })
    @Type(() => String)
    email!: string;

    @ApiProperty({
        required: true,
        type: () => String
    })
    @Type(() => String)
    oldPassword!: string;

    @ApiProperty({
        required: true,
        type: () => String
    })
    @Type(() => String)
    newPassword!: string;
}

export { ResetPasswordInput as ResetPasswordInput };