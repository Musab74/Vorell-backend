
import { Mutation, Resolver, Query, Args } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { Member } from '../../libs/DTO/member/member';
import { LoginInput, MemberInput } from '../../libs/DTO/member/member.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

@Resolver()
export class MemberResolver {
  constructor(private readonly memberService: MemberService) {}

  //mutation = post
  @Mutation(() => Member)
  public async signup(@Args('input') input: MemberInput): Promise<Member> {
      console.log('Mutation: signup');
      return await this.memberService.signup(input);
  }

  @Mutation(() => Member)
  public async login(@Args('input') input: LoginInput): Promise<Member> {
      console.log('Mutation: login');
      return await this.memberService.login(input);
  }

  // Authenticated
  @UseGuards(AuthGuard)
  @Mutation(() => String)
  public async updateMember(@AuthMember("_id") memberId:ObjectId): Promise<string> {
    console.log('updateMember');
    return this.memberService.updateMember();
  }

  @Query(() => String)
  public async getMember(): Promise<string> {
    console.log('getMember');
    return this.memberService.getMember();
  }

  // ADMIN
  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => String)
  public async getAllMemberByAdmin():Promise<string> {
    return this.memberService.getAllMemberByAdmin();
  }

  // Authenticated
  @Mutation(() => String)
  public async updateMemberByAdmin(): Promise<string> {
    console.log('updateMemberByAdmin');
    return this.memberService.updateMemberByAdmin();
  }

}
