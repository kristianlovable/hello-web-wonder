
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, description } = await req.json();
    
    // Get the first list in the project
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: lists } = await supabase
      .from('lists')
      .select('id, position')
      .eq('project_id', projectId)
      .order('position')
      .limit(1)
      .single();

    if (!lists) {
      throw new Error('No list found in project');
    }

    // Generate tasks using AI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a project manager that breaks down projects into actionable tasks. Generate 5-8 specific, actionable tasks. Each task should be clear and implementable.'
          },
          {
            role: 'user',
            content: `Break down this project into tasks: ${description}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    const aiResponse = await response.json();
    const tasks = JSON.parse(aiResponse.choices[0].message.content).tasks;

    // Create tasks in the first list
    const { data: existingCards } = await supabase
      .from('cards')
      .select('position')
      .eq('list_id', lists.id)
      .order('position', { ascending: false })
      .limit(1);

    const startPosition = existingCards?.[0]?.position || 0;

    // Insert all tasks
    const { data: createdTasks, error } = await supabase
      .from('cards')
      .insert(
        tasks.map((task: string, index: number) => ({
          list_id: lists.id,
          title: task,
          position: startPosition + (index + 1) * 1000,
        }))
      )
      .select();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, tasks: createdTasks }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
