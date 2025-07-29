import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberType } from '../../libs/enums/member.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { AllWatchesInquiry, OrdinaryInquiry, StoreWatchesInquiry, WatchesInquiry, WatchInput } from '../../libs/DTO/watch/watch.input';
import { ObjectId } from 'mongoose';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import {  Watch, Watches } from '../../libs/DTO/watch/watch';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { AuthGuard } from '../auth/guards/auth.guard';
import { WatchUpdate } from '../../libs/DTO/watch/watchUpdate';
import { WatchService } from './watch.service';

@Resolver()
export class WatchResolver {
	constructor(private readonly watchService: WatchService) {}

	// CREATE Watch
	@Roles(MemberType.STORE)
	@UseGuards(RolesGuard)
	@Mutation(() => Watch)
	public async createWatch(
		@Args('input') input: WatchInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Watch> {
		input.memberId = memberId;

		return await this.watchService.createWatch(input);
	}

	// GET Watch
	@UseGuards(WithoutGuard)
	@Query(() => Watch)
	public async getWatch(
		@Args('watchId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Watch> {
		console.log('Query: getWatch');
		const watchId = shapeIntoMongoObjectId(input);
		return await this.watchService.getWatch(memberId, watchId);
	}

	// UPDATE WATCH
	@Roles(MemberType.STORE)
	@UseGuards(RolesGuard)
	@Mutation(() => Watch)
	public async updateWatch(
		@Args('input') input: WatchUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Watch> {
		console.log('Mutation: updateWatch');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.watchService.updateWatch(memberId, input);
	}

	// GET Watches
	@UseGuards(WithoutGuard)
	@Query(() => Watches)
	public async getWatches(
		@Args('input') input: WatchesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Watches> {
		console.log('Query: getWatches');
		return await this.watchService.getWatches(memberId, input);
	}

	// GET FAVORITES
	@UseGuards(AuthGuard)
	@Query(() => Watches)
	public async getFavorites(
		@Args('input') input: OrdinaryInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Watches> {
		console.log('Query: getFavorites');
		return await this.watchService.getFavorites(memberId, input);
	}

	// GET VISITED
	@UseGuards(AuthGuard)
	@Query(() => Watches)
	public async getVisited(
		@Args('input') input: OrdinaryInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Watches> {
		console.log('Query: getVisited');
		return await this.watchService.getVisited(memberId, input);
	}

	// GET STORE WATCHES
	@Roles(MemberType.STORE)
	@UseGuards(RolesGuard)
	@Query(() => Watches)
	public async getStoreWatches(
		@Args('input') input: StoreWatchesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Watches> {
		console.log('Query: getStoreWatches');
		return await this.watchService.getStoreWatches(memberId, input);
	}

	// LIKE TARGET watch
	@UseGuards(AuthGuard)
	@Mutation(() => Watch)
	public async likeTargetWatch(
		@Args('watchId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Watch> {
		console.log('Mutation: likeTargetWatch');
		const likeRefId = shapeIntoMongoObjectId(input);
		return await this.watchService.likeTargetWatch(memberId, likeRefId);
	}


	/** ADMIN  */
	// getAllWatchesByAdmin
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => Watches)
	public async getAllWatchesByAdmin(@Args('input') input: AllWatchesInquiry): Promise<Watches> {
		console.log('Query: getAllWatchesByAdmin');
		return await this.watchService.getAllWatchesByAdmin(input);
	}

	// UPDATE Watch BY ADMIN
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Watch)
	public async updateWatchByAdmin(@Args('input') input: WatchUpdate): Promise<Watch> {
		console.log('Mutation: updateWatchByAdmin');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.watchService.updateWatchByAdmin(input);
	}

	// DELETE Watch BY ADMIN
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Watch)
	public async removeWatchByAdmin(@Args('watchId') input: string): Promise<Watch> {
		console.log('Mutation: removeWatchesByAdmin');
		const watchId = shapeIntoMongoObjectId(input);
		return await this.watchService.removeWatchByAdmin(watchId);
	}
}


