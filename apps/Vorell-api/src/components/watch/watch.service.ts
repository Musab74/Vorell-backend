import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ViewService } from '../view/view.service';
import { Model, ObjectId } from 'mongoose';
import { MemberService } from '../member/member.service';
import moment from 'moment';
import { StatisticModifier, T } from '../../libs/types/common';
import { Direction, Message } from '../../libs/enums/common.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { WatchUpdate } from '../../libs/DTO/watch/watchUpdate';
import { lookupAuthMemberLiked, lookUpMember, shapeId, shapeIntoMongoObjectId } from '../../libs/config';
import { LikeGroup } from '../../libs/enums/like.enum';
import { LikeService } from '../like/like.service';
import { AllWatchesInquiry, OrdinaryInquiry, StoreWatchesInquiry, WatchesInquiry, WatchInput } from '../../libs/DTO/watch/watch.input';
import { WatchStatus } from '../../libs/enums/watch.enum';
import { Watch, Watches } from '../../libs/DTO/watch/watch';

@Injectable()
export class WatchService {
  constructor(
    @InjectModel('Watch') private readonly watchModel: Model<Watch>,
    private readonly memberService: MemberService,
    private readonly viewService: ViewService,
    private readonly likeService: LikeService,
  ) {}

  // CREATE Watch
  public async createWatch(input: WatchInput): Promise<Watch> {
    try {
      const result = await this.watchModel.create(input);
      await this.memberService.memberStatsEditor({
        _id: result.memberId,
        targetKey: 'storeWatches',
        modifier: 1,
      });
      return result;
    } catch (err: any) {
      console.log('Error, Service.model:', err?.message);
      throw new BadRequestException(Message.CREATE_FAILED);
    }
  }

  // GET watch
  public async getWatch(memberId: ObjectId, watchId: ObjectId): Promise<Watch> {
    const search: T = {
      _id: watchId,
      watchStatus: WatchStatus.IN_STOCK,
    };

    const targetWatch = await this.watchModel.findOne(search).exec();
    if (!targetWatch) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    if (memberId) {
      // record a view
      const viewInput = { memberId, viewRefId: watchId, viewGroup: ViewGroup.WATCH };
      const newView = await this.viewService.recordView(viewInput);
      if (newView) {
        await this.watchStatsEditor({ _id: watchId, targetKey: 'watchViews', modifier: 1 });
        targetWatch.watchViews++;
      }

      // populate memberData
      targetWatch.memberData = await this.memberService.getMember(targetWatch.memberId, null as any);

      // meLiked
      const likeInput = { memberId, likeRefId: watchId, likeGroup: LikeGroup.WATCH };
      targetWatch.meLiked = await this.likeService.checkLikeExistence(likeInput);
    }

    return targetWatch;
  }

  // UPDATE WATCH (owner)
  public async updateWatch(memberId: ObjectId, input: WatchUpdate): Promise<Watch> {
    let { watchStatus, soldAt, deletedAt } = input;

    const search: T = {
      _id: input._id,
      memberId,
      watchStatus: WatchStatus.IN_STOCK,
    };

    if (watchStatus === WatchStatus.SOLD) soldAt = moment().toDate();
    else if (watchStatus === WatchStatus.DELETE) deletedAt = moment().toDate();

    const result = (await this.watchModel
      .findOneAndUpdate(search, { ...input, soldAt, deletedAt }, { new: true })
      .exec()) as Watch;

    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    if (soldAt || deletedAt) {
      await this.memberService.memberStatsEditor({
        _id: memberId,
        targetKey: 'storeWatches', // corrected key
        modifier: -1,
      });
    }

    return result;
  }

  // Increment/decrement watch counters
  public async watchStatsEditor(input: StatisticModifier): Promise<Watch> {
    const { _id, targetKey, modifier } = input;
    return (await this.watchModel
      .findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true })
      .exec()) as Watch;
  }

  // GET watches (catalog for users)
  public async getWatches(memberId: ObjectId, input: WatchesInquiry): Promise<Watches> {
    const match: T = { watchStatus: WatchStatus.IN_STOCK };
    const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

    this.shapeMatchQuery(match, input);

    if (input?.search?.isLimitedEdition !== undefined) {
      match.isLimitedEdition = input.search.isLimitedEdition;
    }

    const result = await this.watchModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              // meLiked for authed user
              lookupAuthMemberLiked(memberId),
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return result[0];
  }

  // Build $match from incoming filters
  private shapeMatchQuery(match: Record<string, any>, input: WatchesInquiry): void {
    const {
      memberId,
      originList,
      typeList,
      brandList,
      periodsRange,
      movement,
      caseDiameter,
      pricesRange,
      text,
    } = input.search ?? ({} as any);

    if (memberId) match.memberId = shapeId(memberId);
    if (originList?.length) match.watchOrigin = { $in: originList };
    if (typeList?.length) match.watchType = { $in: typeList };
    if (brandList?.length) match.brand = { $in: brandList };
    if (movement?.length) match.movement = { $in: movement };
    if (caseDiameter?.length) match.caseDiameter = { $in: caseDiameter };

    if (pricesRange) {
      match.price = {
        $gte: pricesRange.start,
        $lte: pricesRange.end,
      };
    }

    if (periodsRange) {
      match.createdAt = {
        $gte: periodsRange.start,
        $lte: periodsRange.end,
      };
    }

    if (text) {
      match.modelName = { $regex: new RegExp(text, 'i') };
    }
  }

  // GET favorites list for a member
  public async getFavorites(memberId: ObjectId, input: OrdinaryInquiry): Promise<Watches> {
    return await this.likeService.getFavoriteWatches(memberId, input);
  }

  // GET visited watches for a member
  public async getVisited(memberId: ObjectId, input: OrdinaryInquiry): Promise<Watches> {
    return await this.viewService.getVisitedWatches(memberId, input);
  }

  // Store page: watches for a specific seller/store
  public async getStoreWatches(input: StoreWatchesInquiry): Promise<Watches> {
    const {
      page,
      limit,
      sort = 'createdAt',
      direction = Direction.DESC,
      search = {} as any,
    } = input;

    const { memberId, watchStatus } = search;

    if (!memberId) {
      // Avoid miscounts if auth/wiring is missing
      console.warn('[getStoreWatches] missing memberId; returning empty.');
      return { list: [], metaCounter: [{ total: 0 }] } as any;
    }

    const memberObjId =
      typeof memberId === 'string' ? shapeIntoMongoObjectId(memberId) : memberId;

    const match: T = {
      memberId: memberObjId,
      watchStatus: watchStatus ?? WatchStatus.IN_STOCK,
    };

    const sortStage: T = { [sort]: direction };

    const [agg] = await this.watchModel
      .aggregate([
        { $match: match },
        { $sort: sortStage },
        {
          $facet: {
            list: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              lookUpMember,
              { $unwind: { path: '$memberData', preserveNullAndEmptyArrays: true } },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    return {
      list: agg?.list ?? [],
      metaCounter: agg?.metaCounter?.length ? agg.metaCounter : [{ total: 0 }],
    } as any;
  }

  // LIKE toggle for a watch
  public async likeTargetWatch(memberId: ObjectId, likeRefId: ObjectId): Promise<Watch> {
    const target = await this.watchModel
      .findOne({ _id: likeRefId, watchStatus: WatchStatus.IN_STOCK })
      .exec();
    if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    const input: any = {
      memberId,
      likeRefId,
      likeGroup: LikeGroup.WATCH,
    };

    const modifier: number = await this.likeService.toggleLike(input);
    const result = await this.watchStatsEditor({
      _id: likeRefId,
      targetKey: 'likes',
      modifier,
    });
    if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
    return result;
  }

  // Admin: list all watches w/ filters
  public async getAllWatchesByAdmin(input: AllWatchesInquiry): Promise<Watches> {
    const { watchStatus, originList } = input.search ?? ({} as any);
    const match: T = {};
    const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

    if (watchStatus) match.watchStatus = watchStatus;
    if (originList?.length) match.watchOrigin = { $in: originList }; // fixed field name

    const result = await this.watchModel.aggregate([
      { $match: match },
      { $sort: sort },
      {
        $facet: {
          list: [
            { $skip: (input.page - 1) * input.limit },
            { $limit: input.limit },
            lookUpMember,
            { $unwind: '$memberData' },
          ],
          metaCounter: [{ $count: 'total' }],
        },
      },
    ]);

    if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    return result[0];
  }

  // Admin: update any watch
  public async updateWatchByAdmin(input: WatchUpdate): Promise<Watch> {
    let { watchStatus, soldAt, deletedAt } = input;

    const search: T = {
      _id: input._id,
      watchStatus: WatchStatus.IN_STOCK,
    };

    if (watchStatus === WatchStatus.SOLD) soldAt = moment().toDate();
    else if (watchStatus === WatchStatus.DELETE) deletedAt = moment().toDate();

    const result = await this.watchModel
      .findOneAndUpdate(search, { ...input, soldAt, deletedAt }, { new: true })
      .exec();

    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    if (soldAt || deletedAt) {
      await this.memberService.memberStatsEditor({
        _id: result.memberId,
        targetKey: 'storeWatches',
        modifier: -1,
      });
    }
    return result as Watch;
  }

  // Admin: hard delete a watch already marked as DELETE
  public async removeWatchByAdmin(watchId: ObjectId): Promise<Watch> {
    const search: T = { _id: watchId, watchStatus: WatchStatus.DELETE }; // fixed key name
    const result = await this.watchModel.findOneAndDelete(search).exec();
    if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
    return result as Watch;
  }
}
