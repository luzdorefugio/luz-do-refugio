import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, map, shareReplay } from 'rxjs'; // Adicionei
import { BlogService, BlogPost } from '../../../../core/services/blog.service';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog-list.component.html'
})
export class BlogListComponent implements OnInit {
    private blogService = inject(BlogService);
    featuredPost$!: Observable<BlogPost | undefined>;
    otherPosts$!: Observable<BlogPost[]>;

  constructor() {}

  ngOnInit() {
    // 1. Vamos buscar os posts, mas usamos shareReplay(1)
    // Isto impede que o site carregue o ficheiro JSON duas vezes
    const posts$ = this.blogService.getPostsActives().pipe(shareReplay(1));

    // 2. O 1º post é o destaque (com verificação de segurança)
    this.featuredPost$ = posts$.pipe(
      map(posts => posts.length > 0 ? posts[0] : undefined)
    );

    // 3. Os restantes (do índice 1 para a frente) vão para a grelha
    this.otherPosts$ = posts$.pipe(
      map(posts => posts.length > 1 ? posts.slice(1) : [])
    );
  }
}
