import { ObjectId } from "bson";
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { T } from "./types/common";

// 🎯 Agent/Member sorting (leave as-is if reused for sellers/followers)
export const availableAgentSorts = ["createdAt", "updatedAt", "memberLikes", "memberViews", "memberRank"];
export const availableMemberSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews'];

// ✅ Image configuration
export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];

export const getSerialForImage = (filename: string) => {
  const ext = path.parse(filename).ext;
  return uuidv4() + ext;
};

// ✅ Watch filters and options
export const availableOptions = ['isLimitedEdition']; // previously 'propertyBarter', 'propertyRent'
export const availableWatchSorts = [
  'createdAt',
  'updatedAt',
  'rank',
  'views',
  'likes',
  'price',
];

// ✅ Mongo helpers
export const shapeIntoMongoObjectId = (target: any) => {
  return typeof target === "string" ? new ObjectId(target) : target;
};
export const shapeId = (target: any) => {
  return typeof target === 'string' ? new ObjectId(target) : target;
};

// ✅ MeLiked lookup (used in GraphQL aggregation for watch likes)
export const lookupAuthMemberLiked = (memberId: T, targetRefId: string = '$_id') => {
	return {
		$lookup: {
			from: 'likes',
			let: {
				localLikeRefId: targetRefId,
				localMemberId: memberId,
				localMyFavorite: true,
			},
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [{ $eq: ['$likeRefId', '$$localLikeRefId'] }, { $eq: ['$memberId', '$$localMemberId'] }],
						},
					},
				},
				{
					$project: {
						_id: 0,
						memberId: 1,
						likeRefId: 1,
						myFavorite: '$$localMyFavorite',
					},
				},
			],
			as: 'meLiked',
		},
	};
};

// ✅ Follow lookup (still general)
interface LookupAuthMemberFollowed {
  followerId: T;
  followingId: string;
}

export const lookupAuthMemberFollowed = (input: LookupAuthMemberFollowed) => {
  const { followerId, followingId } = input;
  return {
    $lookup: {
      from: 'follows',
      let: {
        localFollowerId: followerId,
        localFollowingId: followingId,
        localMyFavorite: true,
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$followerId', '$$localFollowerId'] },
                { $eq: ['$followingId', '$$localFollowingId'] },
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            followerId: 1,
            followingId: 1,
            myFollowing: '$$localMyFavorite',
          },
        },
      ],
      as: 'meFollowed',
    },
  };
};

// ✅ Watch lookup (previously property)
export const lookUpMember = {
  $lookup: {
    from: 'members',
    localField: 'sellerId', // updated from memberId
    foreignField: '_id',
    as: 'memberData',
  },
};

export const lookupFollowingData = {
	$lookup: {
		from: 'members',
		localField: 'followingId',
		foreignField: '_id',
		as: 'followingData',
	},
};

export const lookUpFavorite = {
	$lookup: {
		from: 'members',
		localField: 'favoriteWatch.sellerId',
		foreignField: '_id',
		as: 'favoriteWatch.memberData',
	},
};

export const lookUpVisit = {
	$lookup: {
		from: 'members',
		localField: 'visitedWatch.sellerId',
		foreignField: '_id',
		as: 'visitedWatch.memberData',
	},
};

export const lookupFollowerData = {
	$lookup: {
		from: 'members',
		localField: 'followerId',
		foreignField: '_id',
		as: 'followerData',
	},
};
