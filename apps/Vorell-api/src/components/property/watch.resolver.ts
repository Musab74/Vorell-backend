import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PropertyService } from './watch.service';
import { MemberType } from '../../libs/enums/member.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { AllWatchesInquiry, OrdinaryInquiry, StoreWatchesInquiry, WatchInput } from '../../libs/DTO/watch/watch.input';
import { ObjectId } from 'mongoose';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import {  Watch, Watches } from '../../libs/DTO/watch/watch';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { AuthGuard } from '../auth/guards/auth.guard';

@Resolver()
export class PropertyResolver {
	constructor(private readonly propertyService: PropertyService) {}

	// CREATE PROPERTY
	@Roles(MemberType.STORE)
	@UseGuards(RolesGuard)
	@Mutation(() => Watch)
	public async createProperty(
		@Args('input') input: WatchInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Watch> {
		console.log('Mutation createProperty');
		input.memberId = memberId;

		return await this.propertyService.createProperty(input);
	}

	// GET PROPERTY
	@UseGuards(WithoutGuard)
	@Query(() => Watch)
	public async getProperty(
		@Args('propertyId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Watch> {
		console.log('Query: getProperty');
		const propertyId = shapeIntoMongoObjectId(input);
		return await this.propertyService.getProperty(memberId, propertyId);
	}

	// UPDATE PROPERTY
	@Roles(MemberType.STORE)
	@UseGuards(RolesGuard)
	@Mutation(() => Watch)
	public async updateProperty(
		@Args('input') input: PropertyUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Watch> {
		console.log('Mutation: updateProperty');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.propertyService.updateProperty(memberId, input);
	}

	// GET FAVORITES
	@UseGuards(AuthGuard)
	@Query(() => Properties)
	public async getFavorites(
		@Args('input') input: OrdinaryInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Properties> {
		console.log('Query: getFavorites');
		return await this.propertyService.getFavorites(memberId, input);
	}

	// GET VISITED
	@UseGuards(AuthGuard)
	@Query(() => Properties)
	public async getVisited(
		@Args('input') input: OrdinaryInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Properties> {
		console.log('Query: getVisited');
		return await this.propertyService.getVisited(memberId, input);
	}

	// GET PROPERTIES
	@UseGuards(WithoutGuard)
	@Query(() => Properties)
	public async getProperties(
		@Args('input') input: PropertiesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Properties> {
		console.log('Query: getProperties');
		return await this.propertyService.getProperties(memberId, input);
	}

	// GET STORE PROPERTIES
	@Roles(MemberType.STORE)
	@UseGuards(RolesGuard)
	@Query(() => Properties)
	public async getStoreWatches(
		@Args('input') input: StoreWatchesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Properties> {
		console.log('Query: getDealerProperties');
		return await this.propertyService.getStoreWatches(memberId, input);
	}

	// LIKE TARGET PROPERTY
	@UseGuards(AuthGuard)
	@Mutation(() => Watch)
	public async likeTargetProperty(
		@Args('propertyId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Watch> {
		console.log('Mutation: likeTargetProperty');
		const likeRefId = shapeIntoMongoObjectId(input);
		return await this.propertyService.likeTargetProperty(memberId, likeRefId);
	}


	/** ADMIN  */
	// GET ALL Watches BY ADMIN
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => Watches)
	public async getAllPropertiesByAdmin(@Args('input') input: AllWatchesInquiry): Promise<Watches> {
		console.log('Query: getAllPropertiesByAdmin');
		return await this.propertyService.getAllPropertiesByAdmin(input);
	}

	// UPDATE Watch BY ADMIN
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Watch)
	public async updatePropertyByAdmin(@Args('input') input: PropertyUpdate): Promise<Watch> {
		console.log('Mutation: updatePropertyByAdmin');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.propertyService.updatePropertyByAdmin(input);
	}

	// DELETE Watch BY ADMIN
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Watch)
	public async removePropertyByAdmin(@Args('propertyId') input: string): Promise<Watch> {
		console.log('Mutation: removePropertyByAdmin');
		const propertyId = shapeIntoMongoObjectId(input);
		return await this.propertyService.removePropertyByAdmin(propertyId);
	}
}


