import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';

import { City } from "./entities/city.entity.js";

const entities = [
  City
];

@Module({
    imports: [TypeOrmModule.forFeature(entities)],
     exports: [TypeOrmModule],
})
export class DictionariesModule {}