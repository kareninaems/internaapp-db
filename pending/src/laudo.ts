import { supabase } from './auth';

export interface Laudo {
  conteudo: string;
  resumo?: string;
  fonte?: string;
  updated_at?: string;
}

export async function saveLaudo(laudo: Laudo): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sem sessão');

  const { error } = await supabase
    .from('laudo')
    .upsert(
      {
        user_id:   user.id,
        conteudo:  laudo.conteudo,
        resumo:    laudo.resumo ?? null,
        fonte:     laudo.fonte ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (error) throw error;
}

export async function loadLaudo(): Promise<Laudo | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('laudo')
    .select('conteudo, resumo, fonte, updated_at')
    .eq('user_id', user.id)
    .single();

  if (error || !data) return null;
  return data as Laudo;
}

export async function deleteLaudo(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('laudo').delete().eq('user_id', user.id);
}

// Formata o laudo para injeção no contexto do Claude
export function formatLaudoForContext(laudo: Laudo): string {
  return `=== LAUDO CLÍNICO ===\n${laudo.fonte ? `Fonte: ${laudo.fonte}\n` : ''}${laudo.resumo ? `Resumo: ${laudo.resumo}\n\n` : ''}${laudo.conteudo}\n=== FIM DO LAUDO ===`;
}
