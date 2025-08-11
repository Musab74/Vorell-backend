import { registerEnumType } from '@nestjs/graphql';

// Watch Movement (was WatchType)
export enum movement {
  MECHANICAL = 'MECHANICAL',
  AUTOMATIC = 'AUTOMATIC',
  QUARTZ = 'QUARTZ',
}
registerEnumType(movement, {
  name: 'movement',
});

// Watch Category/Type/Style (new enum)
export enum WatchType {
  SPORT = 'SPORT',
  CASUAL = 'CASUAL',
  DRESS = 'DRESS',
  SMART = 'SMART',       
  FASHION = 'FASHION',  
  OTHER = 'OTHER',
}
registerEnumType(WatchType, {
  name: 'WatchType',
});

// Watch Status
export enum WatchStatus {
  IN_STOCK = 'IN_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  SOLD = 'SOLD',
  DELETE = 'DELETE',
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


export enum WatchBrand {
  ROLEX = "Rolex",
  PATEK_PHILIPPE = "Patek Philippe",
  AUDEMARS_PIGUET = "Audemars Piguet",
  OMEGA = "Omega",
  RICHARD_MILLE = "Richard Mille",
  JAEGER_LECOULTRE = "Jaeger-LeCoultre",
  VACHERON_CONSTANTIN = "Vacheron Constantin",
  CARTIER = "Cartier",
  BREITLING = "Breitling",
  HUBLOT = "Hublot",
  TAG_HEUER = "TAG Heuer",
  BREGUET = "Breguet",
  PANERAI = "Panerai",
  APPLE = "Apple",          
  SAMSUNG = "Samsung",       
  GARMIN = "Garmin"           
}

