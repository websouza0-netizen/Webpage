export type Locale = "en" | "pt";

export const emailCopy = {
  en: {
    welcome_receipt: {
      subject: "Welcome to WebSouza",
      heading: "You're in — welcome to WebSouza",
      body: "Thanks for subscribing. Your payment went through and we're ready to start building your site. Next up: tell us about your business in a short brief.",
      cta: "Start your brief",
    },
    brief_received: {
      subject: "We got your brief",
      heading: "Brief received",
      body: "Thanks for the details — we're reviewing your brief now and will start on a design draft shortly. You can edit your answers anytime before development starts.",
      cta: "View your brief",
    },
    design_draft_ready: {
      subject: "Your design draft is ready",
      heading: "Design draft ready",
      body: "We've put together a first draft of your site. Take a look and let us know what you think.",
      cta: "View your dashboard",
    },
    in_development: {
      subject: "Your site is now in development",
      heading: "In development",
      body: "Your design is locked in and we're now building your site. From here, any changes go through a change request rather than the brief.",
      cta: "View progress",
    },
    ready_for_review: {
      subject: "Your site is ready for review",
      heading: "Ready for your review",
      body: "Your site is built and ready for a look. Check the staging link and let us know if anything needs adjusting.",
      cta: "Review your site",
    },
    live: {
      subject: "Your site is live!",
      heading: "You're live!",
      body: "Your site is now live for the world to see. Congratulations — this is the fun part.",
      cta: "View your site",
    },
    post_launch: {
      subject: "Checking in on your new site",
      heading: "Post-launch check-in",
      body: "It's been a little while since launch — checking in to see how things are going and whether anything needs attention.",
      cta: "View your dashboard",
    },
    edit_request_status: {
      subject: "Update on your change request",
      heading: "Your change request was updated",
      body: "The status of a change request you submitted has changed.",
      cta: "View request",
    },
    payment_failed: {
      subject: "We couldn't process your payment",
      heading: "Payment failed",
      body: "We weren't able to charge your card for your WebSouza subscription. Please update your payment details to avoid any interruption.",
      cta: "Update payment method",
    },
    subscription_ended: {
      subject: "Your WebSouza subscription has ended",
      heading: "Subscription ended",
      body: "Your subscription is no longer active. Your site, brief, and past invoices are still visible, but new change requests and add-ons are paused until you resubscribe.",
      cta: "Reactivate your plan",
    },
    owner_notification: {
      subject: "New activity on WebSouza",
      heading: "New activity",
      body: "Something needs your attention.",
      cta: "Open admin",
    },
  },
  pt: {
    welcome_receipt: {
      subject: "Bem-vindo à WebSouza",
      heading: "Tudo pronto — bem-vindo à WebSouza",
      body: "Obrigado por assinar. Seu pagamento foi confirmado e estamos prontos para começar a construir seu site. Próximo passo: conte-nos sobre o seu negócio em um breve formulário.",
      cta: "Preencher briefing",
    },
    brief_received: {
      subject: "Recebemos seu briefing",
      heading: "Briefing recebido",
      body: "Obrigado pelas informações — estamos analisando seu briefing e em breve começaremos um rascunho de design. Você pode editar suas respostas a qualquer momento antes do início do desenvolvimento.",
      cta: "Ver seu briefing",
    },
    design_draft_ready: {
      subject: "Seu rascunho de design está pronto",
      heading: "Rascunho de design pronto",
      body: "Preparamos um primeiro rascunho do seu site. Dê uma olhada e nos diga o que achou.",
      cta: "Ver painel",
    },
    in_development: {
      subject: "Seu site está em desenvolvimento",
      heading: "Em desenvolvimento",
      body: "Seu design foi aprovado e agora estamos construindo seu site. A partir daqui, mudanças passam por um pedido de alteração em vez do briefing.",
      cta: "Ver progresso",
    },
    ready_for_review: {
      subject: "Seu site está pronto para revisão",
      heading: "Pronto para revisão",
      body: "Seu site está construído e pronto para revisão. Confira o link de staging e nos diga se algo precisa ser ajustado.",
      cta: "Revisar site",
    },
    live: {
      subject: "Seu site está no ar!",
      heading: "Você está no ar!",
      body: "Seu site já está no ar para o mundo ver. Parabéns — essa é a parte divertida.",
      cta: "Ver seu site",
    },
    post_launch: {
      subject: "Como está o seu novo site?",
      heading: "Check-in pós-lançamento",
      body: "Já faz um tempo desde o lançamento — passando para saber como as coisas estão indo e se algo precisa de atenção.",
      cta: "Ver painel",
    },
    edit_request_status: {
      subject: "Atualização do seu pedido de alteração",
      heading: "Seu pedido de alteração foi atualizado",
      body: "O status de um pedido de alteração que você enviou foi alterado.",
      cta: "Ver pedido",
    },
    payment_failed: {
      subject: "Não conseguimos processar seu pagamento",
      heading: "Pagamento falhou",
      body: "Não conseguimos cobrar seu cartão para a assinatura da WebSouza. Atualize os dados de pagamento para evitar qualquer interrupção.",
      cta: "Atualizar pagamento",
    },
    subscription_ended: {
      subject: "Sua assinatura WebSouza foi encerrada",
      heading: "Assinatura encerrada",
      body: "Sua assinatura não está mais ativa. Seu site, briefing e faturas anteriores continuam visíveis, mas novos pedidos de alteração e add-ons ficam pausados até você reativar.",
      cta: "Reativar plano",
    },
    owner_notification: {
      subject: "Nova atividade na WebSouza",
      heading: "Nova atividade",
      body: "Algo precisa da sua atenção.",
      cta: "Abrir admin",
    },
  },
} as const;

export type EmailTemplate = keyof typeof emailCopy.en;
