import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

class ResetPasswordOutput {
    @ApiProperty({
        required: true,
        type: () => Boolean
    })
    @Type(() => Boolean)
    success!: boolean;

    @ApiProperty({
        required: false,
        type: () => String
    })
    @Type(() => String)
    message?: string;
}

export { ResetPasswordOutput as ResetPasswordOutput };