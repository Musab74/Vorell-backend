
import { Mutation, Resolver, Query, Args } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { Member } from '../../libs/DTO/member/member';
import { LoginInput, MemberInput } from '../../libs/DTO/member/member.input';

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
