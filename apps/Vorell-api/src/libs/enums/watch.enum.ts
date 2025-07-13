import { registerEnumType } from '@nestjs/graphql';

// Watch Type
export enum WatchType {
  MECHANICAL = 'MECHANICAL',
  AUTOMATIC = 'AUTOMATIC',
  QUARTZ = 'QUARTZ',
}
registerEnumType(WatchType, {
  name: 'WatchType',
});

// Watch Status
export enum WatchStatus {
  IN_STOCK = 'IN_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  PREORDER = 'PREORDER',
  DISCONTINUED = 'DISCONTINUED',
}
registerEnumType(WatchStatus, {
  name: 'WatchStatus',
});

// Watch Origin (Location)
export enum WatchOrigin {
  SWITZERLAND = 'SWITZERLAND',
  GERMANY = 'GERMANY',
  JAPAN = 'JAPAN',
  FRANCE = 'FRANCE',
  ITALY = 'ITALY',
  USA = 'USA',
  SOUTH_KOREA = 'SOUTH_KOREA',
  OTHER = 'OTHER',
}
registerEnumType(WatchOrigin, {
  name: 'WatchOrigin',
});
