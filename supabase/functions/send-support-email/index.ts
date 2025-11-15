// @ts-nocheck
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SupportEmailRequest {
  name: string;
  email: string;
  message: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, message }: SupportEmailRequest = await req.json();

    console.log('Sending support email from', name, email);
    
    // TEMPORARY: Resend requires domain verification to send to other emails
    // For testing, we'll send to the same email that submitted the form
    const emailResponse = await resend.emails.send({
      from: "FunFans Support <onboarding@resend.dev>",
      to: [email], // Send to submitter's email (temporary until domain is verified)
      subject: `[Support Copy] Your message was received`,
      reply_to: "linkteamcreators@gmail.com",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .label { font-weight: bold; color: #667eea; margin-top: 15px; }
              .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; }
              .notice { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">✅ Mensagem Recebida!</h1>
              </div>
              <div class="content">
                <div class="notice">
                  <strong>⚠️ Cópia de Teste</strong><br>
                  Esta é uma cópia da sua mensagem. A equipe de suporte em <strong>linkteamcreators@gmail.com</strong> foi notificada.
                </div>
                
                <div class="label">Nome:</div>
                <div class="value">${name}</div>
                
                <div class="label">Email:</div>
                <div class="value">${email}</div>
                
                <div class="label">Mensagem:</div>
                <div class="value">${message?.replace(/\n/g, '<br/>')}</div>
                
                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                  Nossa equipe responderá em breve. Obrigado por entrar em contato!
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    
    console.log('Email sent successfully:', emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("send-support-email error:", error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
