import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { CONSTANTS } from '@shared/constants';

import { Anime } from '@shared/entities/anime/anime.entity';

import { CreateAnimeRequest } from '@shared/dto/anime/create-anime.dto';
import { UpdateAnimeRequest } from '@shared/dto/anime/update-anime.dto';
import { JikanAnime } from '@shared/dto/anime/jikan-api.dto';

@Injectable()
export class AnimeService {
  constructor(
    @Inject('ANIME-SERVICE') private readonly animeService: ClientKafka,
  ) {}

  async parseAnimes(name: string): Promise<JikanAnime[]> {
    const animes = await firstValueFrom(
      this.animeService.send(CONSTANTS.KAFKA_TOPICS.ANIME.PARSE, name),
    );

    return animes;
  }

  async findAllByUser(userId: string): Promise<Anime[]> {
    const animes = await firstValueFrom(
      this.animeService.send(CONSTANTS.KAFKA_TOPICS.ANIME.FIND_ALL, userId),
    );

    return animes;
  }

  async create(data: CreateAnimeRequest): Promise<Anime> {
    const anime = await firstValueFrom(
      this.animeService.send(
        CONSTANTS.KAFKA_TOPICS.ANIME.CREATE,
        JSON.stringify(data),
      ),
    );

    return anime;
  }

  async update(data: UpdateAnimeRequest): Promise<Anime> {
    const anime = await firstValueFrom(
      this.animeService.send(
        CONSTANTS.KAFKA_TOPICS.ANIME.UPDATE,
        JSON.stringify(data),
      ),
    );

    return anime;
  }

  async remove(id: string): Promise<Anime> {
    const anime = await firstValueFrom(
      this.animeService.send(CONSTANTS.KAFKA_TOPICS.ANIME.REMOVE, id),
    );

    return anime;
  }
}
