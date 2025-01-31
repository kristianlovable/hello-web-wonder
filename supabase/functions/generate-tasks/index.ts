
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
    
    if (!projectId || !description) {
      throw new Error('Project ID and description are required');
    }

    console.log('Generating tasks for project:', projectId);
    console.log('Project description:', description);
    
    // Get the first list in the project
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: lists, error: listError } = await supabase
      .from('lists')
      .select('id, position')
      .eq('project_id', projectId)
      .order('position')
      .limit(1)
      .single();

    if (listError) {
      console.error('Error fetching list:', listError);
      throw new Error('Failed to fetch project list');
    }

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
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a project manager that breaks down projects into actionable tasks. Generate 5-8 specific, actionable tasks. Each task should be clear and implementable. Return the tasks as a JSON array.'
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

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error('Failed to generate tasks with AI');
    }

    const aiResponse = await response.json();
    console.log('OpenAI response:', aiResponse);

    if (!aiResponse.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from AI service');
    }

    let tasks;
    try {
      tasks = JSON.parse(aiResponse.choices[0].message.content).tasks;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI response');
    }

    if (!Array.isArray(tasks)) {
      throw new Error('Invalid tasks format from AI service');
    }

    // Create tasks in the first list
    const { data: existingCards, error: cardsError } = await supabase
      .from('cards')
      .select('position')
      .eq('list_id', lists.id)
      .order('position', { ascending: false })
      .limit(1);

    if (cardsError) {
      console.error('Error fetching existing cards:', cardsError);
      throw new Error('Failed to fetch existing cards');
    }

    const startPosition = existingCards?.[0]?.position || 0;

    // Insert all tasks
    const { data: createdTasks, error: insertError } = await supabase
      .from('cards')
      .insert(
        tasks.map((task: string, index: number) => ({
          list_id: lists.id,
          title: task,
          position: startPosition + (index + 1) * 1000,
        }))
      )
      .select();

    if (insertError) {
      console.error('Error inserting tasks:', insertError);
      throw new Error('Failed to create tasks');
    }

    console.log('Successfully created tasks:', createdTasks);

    return new Response(JSON.stringify({ success: true, tasks: createdTasks }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
