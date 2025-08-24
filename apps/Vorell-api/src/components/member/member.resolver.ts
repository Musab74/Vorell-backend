import { Mutation, Resolver, Query, Args } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { Member, Members } from '../../libs/DTO/member/member';
import { LoginInput, MemberInput, MembersInquiry, StoresInquiry } from '../../libs/DTO/member/member.input';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberUpdate } from '../../libs/DTO/member/update.member';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { getSerialForImage, lookupAuthMemberLiked, validMimeTypes } from '../../libs/config';
import { LikeInput } from '../../libs/DTO/like/like.input';
import { Message } from '../../libs/enums/common.enum';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { pipeline } from 'stream/promises';

@Resolver()
export class MemberResolver {
	constructor(private readonly memberService: MemberService) { }

	//mutation = post
	@Mutation(() => Member)
	public async signup(@Args('input') input: MemberInput): Promise<Member> {
		return await this.memberService.signup(input);
	}

	@Mutation(() => Member)
	public async login(@Args('input') input: LoginInput): Promise<Member> {
		return await this.memberService.login(input);
	}

	// Authenticated
	@UseGuards(AuthGuard)
	@Mutation(() => Member)
	public async updateMember(
		@Args("input")
		input: MemberUpdate,
		@AuthMember("_id") memberId: ObjectId): Promise<Member> {
		delete input._id;
		return this.memberService.updateMember(memberId, input);
	}

	@UseGuards(WithoutGuard)
	@Query(() => Member)
	public async getMember(
		@Args('memberId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Member> {
		const targetId = shapeIntoMongoObjectId(input);
		return await this.memberService.getMember(targetId, memberId);
	}

	@UseGuards(WithoutGuard)
	@Query(() => Members)
	public async getStores(
		@Args('input') input: StoresInquiry,
		@AuthMember('_id') memberId: ObjectId, //
	): Promise<Members> {
		return await this.memberService.getStores(memberId, input);
	}

	//Image uploader
	/** SINGLE FILE **/
	@UseGuards(AuthGuard)
	@Mutation(() => String)
	public async imageUploader(
		@Args({ name: 'file', type: () => GraphQLUpload }) file: FileUpload,
		@Args('target') target: string,
	): Promise<string> {
		console.log('Mutation: imageUploader');

		const { createReadStream, filename, mimetype } = file;
		if (!filename) throw new BadRequestException(Message.UPLOAD_FAILED);

		const validMime = validMimeTypes.includes(mimetype);
		if (!validMime) throw new BadRequestException(Message.PROVIDE_ALLOWED_FORMAT);

		// ensure dir exists: uploads/<target>
		const dir = join(process.cwd(), 'uploads', target);
		if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

		const imageName = getSerialForImage(filename);
		const relPath = join('uploads', target, imageName);
		const absPath = join(process.cwd(), relPath);

		await new Promise<void>((resolve, reject) => {
			const write = createWriteStream(absPath);
			createReadStream()
				.on('error', (e) => reject(new BadRequestException(Message.UPLOAD_FAILED)))
				.pipe(write)
				.on('finish', () => resolve())
				.on('error', (e) => reject(new BadRequestException(Message.UPLOAD_FAILED)));
		});

		return relPath;
	}

	/** MULTI FILE **/
	@UseGuards(AuthGuard)
	@Mutation(() => [String])
	public async imagesUploader(
		@Args('files', { type: () => [GraphQLUpload] }) files: Promise<FileUpload>[],
		@Args('target') target: string,
	): Promise<string[]> {
		console.log('Mutation: imagesUploader');

		const out: string[] = [];

		// ensure dir exists: uploads/<target>
		const dir = join(process.cwd(), 'uploads', target);
		if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

		await Promise.all(
			files.map(async (p, index) => {
				try {
					const { filename, mimetype, createReadStream } = await p;

					if (!filename) throw new BadRequestException(Message.UPLOAD_FAILED);
					const validMime = validMimeTypes.includes(mimetype);
					if (!validMime) throw new BadRequestException(Message.PROVIDE_ALLOWED_FORMAT);

					const imageName = getSerialForImage(filename);
					const relPath = join('uploads', target, imageName);
					const absPath = join(process.cwd(), relPath);

					await new Promise<void>((resolve, reject) => {
						const write = createWriteStream(absPath);
						createReadStream()
							.on('error', () => reject(new BadRequestException(Message.UPLOAD_FAILED)))
							.pipe(write)
							.on('finish', () => resolve())
							.on('error', () => reject(new BadRequestException(Message.UPLOAD_FAILED)));
					});

					out[index] = relPath;
				} catch (err) {
					console.log('imagesUploader item failed:', (err as any)?.message || err);
					// If you prefer to fail the whole mutation on first error, rethrow here:
					// throw err;
				}
			}),
		);

		if (!out.some(Boolean)) throw new BadRequestException('NO_FILES_RECEIVED');
		return out.filter(Boolean);
	}



	// Authenticated
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => Members)
	public async getAllMembersByAdmin(@Args('input') input: MembersInquiry): Promise<Members> {
		return await this.memberService.getAllMembersByAdmin(input);
	}


	@UseGuards(AuthGuard)
	@Mutation(() => Member)
	public async likeTargetMember(
		@Args('memberId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Member> {
		const likeRefId = shapeIntoMongoObjectId(input);
		return await this.memberService.likeTargetMember(memberId, likeRefId);
	}

	// Authorization ADMIN
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Member)
	public async updateMemberByAdmin(@Args('input') input: MemberUpdate): Promise<Member> {
		return await this.memberService.updateMemberByAdmin(input);
	}

}
