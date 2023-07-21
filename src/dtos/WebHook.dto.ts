import { IsString } from 'class-validator';

class WebHookDto {
  @IsString()
  event: string;
  @IsString()
  createdAt: string;
}

export default WebHookDto;
