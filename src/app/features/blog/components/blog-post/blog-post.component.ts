import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BlogService, BlogPost } from '../../../../core/services/blog.service';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-blog-post',
    imports: [CommonModule, RouterModule],
    templateUrl: './blog-post.component.html',
    styleUrls: ['./blog-post.component.scss']
})
export class BlogPostComponent implements OnInit {
    blogService = inject(BlogService);
    route = inject(ActivatedRoute);
    post$!: Observable<BlogPost | undefined>;

  constructor() {}

    ngOnInit() {
        this.post$ = this.route.paramMap.pipe(
            switchMap(params => {
                const slug = params.get('slug')!;
                return this.blogService.getPostBySlug(slug);
            })
        );
    }

partilhar(plataforma: string) {
  // Pega o URL atual da página onde estás
  const urlAtual = encodeURIComponent(window.location.href);
  const texto = encodeURIComponent('Adorei esta vela da Luz do Refúgio! 🕯️');
  let urlPartilha = '';

  switch (plataforma) {
    case 'x':
      urlPartilha = `https://twitter.com/intent/tweet?url=${urlAtual}&text=${texto}`;
      break;
    case 'facebook':
      urlPartilha = `https://www.facebook.com/sharer/sharer.php?u=${urlAtual}`;
      break;
    case 'whatsapp':
      urlPartilha = `https://wa.me/?text=${texto}%20${urlAtual}`;
      break;
  }

  // Abre uma janela popup para partilhar
  if (urlPartilha) {
    window.open(urlPartilha, '_blank', 'width=600,height=400');
  }
}
}
