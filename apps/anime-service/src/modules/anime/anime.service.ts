import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { RpcException } from '@nestjs/microservices';

import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';

import { CreateAnimeRequest } from '@shared/dto/anime/create-anime.dto';
import { UpdateAnimeRequest } from '@shared/dto/anime/update-anime.dto';

import { Anime } from '@shared/entities/anime/anime.entity';
import { JikanAnime } from '@shared/dto/anime/jikan-api.dto';

import { mapAnimesResponse } from './utils/map-animes-response';

import { DatesService } from '../dates/dates.service';

@Injectable()
export class AnimeService {
  constructor(
    @InjectRepository(Anime)
    private readonly animeRepository: Repository<Anime>,
    private readonly httpService: HttpService,
  ) {}

  async parseAnimes(name: string): Promise<JikanAnime[]> {
    const response = await firstValueFrom(this.httpService.get(name));

    const animes = mapAnimesResponse(response);

    return animes;
  }

  async findAllByUser(userId: string): Promise<Anime[]> {
    const animes = await this.animeRepository.find({ where: { userId } });

    return animes;
  }

  async create(data: CreateAnimeRequest): Promise<Anime> {
    const anime = await this.animeRepository.create(data);

    const dates = DatesService.getDatesByStatus(
      anime.status,
      anime.startDate,
      anime.endDate,
    );

    return this.animeRepository.save({ ...anime, ...dates });
  }

  async update(data: UpdateAnimeRequest): Promise<Anime> {
    const anime = await this.animeRepository.preload(data);

    if (!anime) throw new RpcException('Anime does not exist');

    const dates = DatesService.getDatesByStatus(
      anime.status,
      anime.startDate,
      anime.endDate,
    );

    return this.animeRepository.save({ ...data, ...dates });
  }

  async remove(id: string): Promise<Anime> {
    const anime = await this.animeRepository.findOne(id);

    if (!anime) throw new RpcException('Anime does not exist');

    return this.animeRepository.remove(anime);
  }
}
