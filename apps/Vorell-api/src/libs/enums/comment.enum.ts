import { registerEnumType } from '@nestjs/graphql';

export enum CommentStatus {
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}
registerEnumType(CommentStatus, {
	name: 'CommentStatus',
});

export enum CommentGroup {
	STORE = 'STORE',
	MEMBER = 'MEMBER',
	ARTICLE = 'ARTICLE',
	WATCH = 'WATCH',
	COMMENT = 'COMMENT',
}

registerEnumType(CommentGroup, {
	name: 'CommentGroup',
});
