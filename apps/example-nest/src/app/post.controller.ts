import { Controller, Get, Query } from '@nestjs/common';
import { apiBlog } from '@ts-rest/example-contracts';
import {
  nestControllerContract,
  NestControllerInterface,
  NestRequestShapes,
  TsRest,
  TsRestRequest,
} from '@ts-rest/nest';
import { PostService } from './post.service';

const c = nestControllerContract(apiBlog);
type RequestShapes = NestRequestShapes<typeof c>;

// You can implement the NestControllerInterface interface to ensure type safety
@Controller()
export class PostController implements NestControllerInterface<typeof c> {
  constructor(private readonly postService: PostService) {}

  @Get('/test')
  test(@Query() queryParams: any) {
    return { queryParams };
  }

  @TsRest(c.getPosts)
  async getPosts(
    @TsRestRequest()
    { query: { take, skip, search } }: RequestShapes['getPosts']
  ) {
    const { posts, totalPosts } = await this.postService.getPosts({
      take,
      skip,
      search,
    });

    return {
      status: 200 as const,
      body: { posts, count: totalPosts, skip, take },
    };
  }

  @TsRest(c.getPost)
  async getPost(@TsRestRequest() { params: { id } }: RequestShapes['getPost']) {
    const post = await this.postService.getPost(id);

    if (!post) {
      return { status: 404 as const, body: null };
    }

    return { status: 200 as const, body: post };
  }

  @TsRest(c.createPost)
  async createPost(@TsRestRequest() { body }: RequestShapes['createPost']) {
    const post = await this.postService.createPost({
      title: body.title,
      content: body.content,
      published: body.published,
      description: body.description,
    });

    return { status: 201 as const, body: post };
  }

  @TsRest(c.updatePost)
  async updatePost(
    @TsRestRequest() { params: { id }, body }: RequestShapes['updatePost']
  ) {
    const post = await this.postService.updatePost(id, {
      title: body.title,
      content: body.content,
      published: body.published,
      description: body.description,
    });

    return { status: 200 as const, body: post };
  }

  @TsRest(c.deletePost)
  async deletePost(
    @TsRestRequest() { params: { id } }: RequestShapes['deletePost']
  ) {
    await this.postService.deletePost(id);

    return { status: 200 as const, body: { message: 'Post Deleted' } };
  }

  @TsRest(c.testPathParams)
  async testPathParams(
    @TsRestRequest() { params }: RequestShapes['testPathParams']
  ) {
    return { status: 200 as const, body: params };
  }
}
