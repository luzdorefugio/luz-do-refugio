import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

    private colors = {
        bordeaux: '#570419', // Ajusta ao teu var(--lumiere-bordeaux)
        gold: '#D4AF37',     // Ajusta ao teu var(--lumiere-gold)
        cream: '#FDFBF7'
    };

    /**
    * Sucesso (Venda registada, Produto criado...)
    */
    success(message: string) {
        Swal.fire({
            icon: 'success',
            title: 'Sucesso!',
            text: message,
            confirmButtonColor: this.colors.bordeaux,
            timer: 2000,
            timerProgressBar: true
        });
    }

    /**
    * Erro (Stock insuficiente, Erro de servidor...)
    */
    error(message: string) {
        Swal.fire({
            icon: 'error',
            title: 'Ups...',
            text: message,
            confirmButtonColor: this.colors.bordeaux
        });
    }

    /**
    * Método Inteligente para erros de API (Backend)
    * @param err O objeto de erro completo que vem do subscribe error
    * @param context (Opcional) Uma frase para dar contexto, ex: "Erro ao produzir"
    */
    apiError(err: any, context: string = 'Ocorreu um erro') {
        let detailedMessage = err.error?.message;
        if (!detailedMessage) {
            detailedMessage = err.message || 'Erro desconhecido de comunicação.';
        }
        const finalMessage = `${context}: ${detailedMessage}`;
        Swal.fire({
            icon: 'error',
            title: 'Atenção',
            text: finalMessage,
            confirmButtonColor: this.colors.bordeaux,
            confirmButtonText: 'Entendido'
        });
    }

    /**
    * Confirmação (Tem a certeza que quer apagar?)
    * Retorna uma Promise<boolean>
    */
    async confirm(message: string, confirmButtonText = 'Sim, continuar'): Promise<boolean> {
        const result = await Swal.fire({
            title: 'Tem a certeza?',
            text: message,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: this.colors.bordeaux,
            cancelButtonColor: '#d33',
            confirmButtonText: confirmButtonText,
            cancelButtonText: 'Cancelar'
        });
        return result.isConfirmed;
    }
}
