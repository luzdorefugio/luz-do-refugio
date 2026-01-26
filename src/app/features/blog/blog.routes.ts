import { Routes } from '@angular/router';
import { BlogLayoutComponent } from './components/blog-layout/blog-layout.component';
import { BlogListComponent } from './components/blog-list/blog-list.component';
import { BlogPostComponent } from './components/blog-post/blog-post.component';

export const BLOG_ROUTES: Routes = [
  {
    path: '',
    component: BlogLayoutComponent, // O Layout próprio do Blog
    children: [
      // Rota: /blog
      {
        path: '',
        component: BlogListComponent,
        title: 'Blog - Luz do Refúgio'
      },
      // Rota: /blog/como-cuidar-das-velas
      {
        path: ':slug',
        component: BlogPostComponent,
        title: 'Artigo - Luz do Refúgio'
      }
    ]
  }
];
