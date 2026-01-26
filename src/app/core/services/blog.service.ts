import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface BlogPost {
    slug: string;
    title: string;
    summary: string;
    content: string;
    image: string;
    date: string;
    author: string;
    minReaderTime: string;
    active: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class BlogService {
    private jsonUrl = 'blog/data/blog.json';

    constructor(private http: HttpClient) {}

    getPostsActives(): Observable<BlogPost[]> {
        return this.http.get<BlogPost[]>(this.jsonUrl).pipe(
            map(posts => posts.filter(post => post.active === true))
        );
    }

    getPostBySlug(slug: string): Observable<BlogPost | undefined> {
        return this.getPostsActives().pipe(
            map((posts: BlogPost[]) => posts.find(post => post.slug === slug))
        );
    }
}
