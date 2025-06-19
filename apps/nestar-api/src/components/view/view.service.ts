import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { T } from '../../libs/types/common';
import { ViewInput } from '../../libs/DTO/Views/view.input';
import { View } from '../../libs/DTO/Views/view';

@Injectable()
export class ViewService {
  constructor(@InjectModel('View') private readonly viewModel: Model<View>) {}

  public async recordView(input: ViewInput): Promise<View | null> {
    const exist = await this.checkView(input);
    if (!exist) {
      return await this.viewModel.create(input);
    } else return null;
  }

  private async checkView(input: ViewInput): Promise<View | null> {
    const { memberId, viewRefId } = input;
    const search: T = {
      memberId: memberId,
      viewRefId: viewRefId,
    };

    return await this.viewModel.findOne(search).exec();
  }
}