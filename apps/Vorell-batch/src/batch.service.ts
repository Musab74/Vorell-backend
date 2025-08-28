import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Member } from 'apps/Vorell-api/src/libs/DTO/member/member';
import { Watch } from 'apps/Vorell-api/src/libs/DTO/watch/watch';
import { MemberStatus, MemberType } from 'apps/Vorell-api/src/libs/enums/member.enum';
import { WatchStatus } from 'apps/Vorell-api/src/libs/enums/watch.enum';
import { Model } from 'mongoose';

@Injectable()
export class BatchService {
  constructor(
    @InjectModel('Watch') private readonly watchModel: Model<Watch>,
    @InjectModel('Member') private readonly memberModel: Model<Member>,
  ) {}

  /**
   * Reset ranks to 0 for active, in-stock entities.
   */
  public async batchRollback(): Promise<void> {
    // Reset watch ranks
    await this.watchModel
      .updateMany(
        { watchStatus: WatchStatus.IN_STOCK },
        { rank: 0 },
      )
      .exec();

    // Reset member (store) ranks
    await this.memberModel
      .updateMany(
        { memberStatus: MemberStatus.ACTIVE, memberType: MemberType.STORE },
        { memberRank: 0 },
      )
      .exec();
  }

  /**
   * Compute top watches 
   * rank = likes * 2 + watchViews * 1
   * Only compute for in-stock watches whose rank is 0 (fresh).
   */
  public async batchTopWatches(): Promise<void> {
    const watches: Watch[] = await this.watchModel
      .find({
        watchStatus: WatchStatus.IN_STOCK,
        rank: 0,
      })
      .exec();

    const promisedList = watches.map(async (w: any) => {
      const { _id, likes = 0, watchViews = 0 } = w;
      const rank = (Number(likes) || 0) * 2 + (Number(watchViews) || 0) * 1;
      return this.watchModel.findByIdAndUpdate(_id, { rank });
    });

    await Promise.all(promisedList);
  }

  /**
   * Compute top stores/agents (members).
   * rank = storeWatches * 5 + memberArticles * 3 + memberLikes * 2 + memberViews * 1
   * Only compute for ACTIVE STORE members whose rank is 0 (fresh).
   */
  public async batchTopAgents(): Promise<void> {
    const stores: Member[] = await this.memberModel
      .find({
        memberType: MemberType.STORE,
        memberStatus: MemberStatus.ACTIVE,
        memberRank: 0,
      })
      .exec();

    const promisedList = stores.map(async (m: any) => {
      const {
        _id,
        storeWatches = 0,
        memberArticles = 0,
        memberLikes = 0,
        memberViews = 0,
      } = m;

      const rank =
        (Number(storeWatches) || 0) * 5 +
        (Number(memberArticles) || 0) * 3 +
        (Number(memberLikes) || 0) * 2 +
        (Number(memberViews) || 0) * 1;

      return this.memberModel.findByIdAndUpdate(_id, { memberRank: rank });
    });

    await Promise.all(promisedList);
  }

  public getHello(): string {
    return 'Welcome to Vorell Batch API Server!';
  }
}
