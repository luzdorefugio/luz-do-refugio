export class User {
  id?: string; // Adicionei o ID, é importante para updates
  name: string = '';
  role: string = '';
  email?: string;

  // --- NOVOS CAMPOS PARA PERFIL & CHECKOUT ---
  phone?: string;
  nif?: string;
  address?: string;
  city?: string;
  zipCode?: string;

  // Construtor que aceita dados parciais (útil para criar a partir de JSON)
  constructor(data?: Partial<User>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  // ✨ A GRANDE VANTAGEM DAS CLASSES: Métodos e Getters!

  // Verifica se é admin sem teres de escrever "role === 'ADMIN'" em todo o lado
  get isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  // Gera as iniciais (ex: "Fabriqueiro" -> "F")
  get initials(): string {
    return this.name ? this.name.charAt(0).toUpperCase() : '?';
  }
}
