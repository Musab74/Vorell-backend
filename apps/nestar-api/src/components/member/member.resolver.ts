
import { Mutation, Resolver, Query, Args } from '@nestjs/graphql';
import { MemberService } from './member.service';
import {
  InternalServerErrorException,
} from '@nestjs/common';
import { Member } from '../../libs/DTO/member/member';
import { LoginInput, MemberInput } from '../../libs/DTO/member/member.input';

@Resolver()
export class MemberResolver {
  constructor(private readonly memberService: MemberService) {}

  //mutation = post
  @Mutation(() => Member)
  public async signup(@Args('input') input: MemberInput): Promise<Member> {
    try {
      console.log('Mutation: signup');
      console.log('input', input);
      return await this.memberService.signup(input);
    } catch (error) {
      console.log('Error: signup', error);
      throw new InternalServerErrorException(error);
    }
  }

  @Mutation(() => Member)
  public async login(@Args('input') input: LoginInput): Promise<Member> {
    try {
      console.log('Mutation: login');
      console.log('input', input);
      return await this.memberService.login(input);
    } catch (error) {
      console.log('Error: login', error);
      throw new InternalServerErrorException(error);
    }
  }

  @Mutation(() => String)
  public async updateMember(): Promise<string> {
    console.log('updateMember');
    return this.memberService.updateMember();
  }

  @Query(() => String)
  public async getMember(): Promise<string> {
    console.log('getMember');
    return this.memberService.getMember();
  }
}
