import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { join } from 'path';

// Catch all HTTP exceptions to serve the custom 404 page for browser requests
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const acceptHeader = request.headers.accept || '';
    
    // For browser requests (GET and accepts HTML) that are 401, 403, or 404, serve 404.html
    if (
      request.method === 'GET' && 
      acceptHeader.includes('text/html') &&
      [401, 403, 404].includes(status)
    ) {
      const publicPath = join(process.cwd(), 'public', '404.html');
      return response.sendFile(publicPath);
    }

    // For other requests (e.g., API) or other statuses, return standard JSON
    response.status(status).json(exception.getResponse());
  }
}
