import type { GenerationType } from '@/lib/supabase';

// ─── Text Generation ──────────────────────────────────────────────

export interface TextGenInput {
  contentType: string;
  topic: string;
  audience: string;
  tone: string;
  length: string;
  language: string;
  additional: string;
}

export async function generateText(input: TextGenInput): Promise<string> {
  await delay(1200 + Math.random() * 800);

  const { contentType, topic, audience, tone, length, language, additional } = input;
  const wordCount = length === 'short' ? 150 : length === 'long' ? 600 : 350;

  const templates: Record<string, (t: string, aud: string, tn: string) => string> = {
    'Blog post': (t, aud, tn) => `# ${capitalize(t)}: A Complete Guide

In today's rapidly evolving landscape, understanding ${t} has become essential for ${aud}. Whether you're just getting started or looking to deepen your expertise, this article breaks down everything you need to know.

## Why ${capitalize(t)} Matters

The significance of ${t} cannot be overstated. For ${aud}, it represents an opportunity to ${tn === 'professional' ? 'streamline operations and drive measurable results' : 'explore new possibilities and unlock creative potential'}. Recent trends show that organizations and individuals who embrace ${t} early gain a substantial advantage.

## Key Principles

1. **Start with clarity** — Define what you want to achieve with ${t} before diving in.
2. **Build incrementally** — Small, consistent steps produce better outcomes than large, sporadic efforts.
3. **Measure and adapt** — Track your progress and adjust your approach based on what works.

## Practical Steps

Getting started with ${t} requires a thoughtful approach. Begin by assessing your current situation and identifying gaps. Then, create a roadmap that aligns with your goals as ${aud}. Remember that progress is rarely linear — expect setbacks and learn from them.

## Best Practices

- Focus on fundamentals before advanced techniques
- Seek feedback from peers and mentors
- Document your journey for future reference
- Stay updated with the latest developments

## Conclusion

${capitalize(t)} is a journey, not a destination. By approaching it with curiosity, discipline, and the right mindset, ${aud} can achieve remarkable results. Start small, stay consistent, and watch your expertise grow over time.`,

    'Email': (t, aud, tn) => `Subject: ${capitalize(t)} — Action Required

Dear ${aud},

I hope this message finds you well. I'm writing to share important updates regarding ${t} and outline the next steps for our team.

## Summary

After careful consideration, we've identified key areas where ${t} can create immediate impact. This aligns with our broader goals and represents an exciting opportunity for everyone involved.

## What's Changing

We are implementing a structured approach to ${t} that will:
- Streamline current workflows
- Reduce overhead and redundancy
- Create clearer accountability
- Enable better tracking of outcomes

## Next Steps

1. Review the attached documentation
2. Share your feedback by end of week
3. Attend the upcoming planning session
4. Prepare questions for the Q&A segment

## Timeline

We aim to roll out these changes over the coming weeks, ensuring a smooth transition with minimal disruption to existing processes.

Please don't hesitate to reach out if you have any questions or concerns. Your input is valuable and will help shape the final approach.

Best regards,
[Your Name]`,

    'Social media post': (t, aud, tn) => `🚀 Excited to share something about ${t}!

Did you know that ${aud} who focus on ${t} see better results? Here's what's working right now:

✅ Start with a clear goal
✅ Take consistent action
✅ Measure what matters
✅ Iterate and improve

The ${tn} approach to ${t} is changing the game. Don't get left behind!

What's your experience with ${t}? Drop a comment below 👇

#${t.replace(/\s+/g, '')} #Growth #Success #${aud.replace(/\s+/g, '')}`,

    'Marketing copy': (t, aud, tn) => `## ${capitalize(t)} — Designed for ${aud}

### Headline
Transform Your Approach to ${capitalize(t)} Today

### Subheadline
The ${tn} solution that ${aud} trust to get results — faster, smarter, and with less effort.

### Body Copy

Stop struggling with ${t}. Our proven system helps ${aud} achieve more in less time, without the guesswork.

**Here's what you get:**
- A clear, step-by-step framework
- Tools and templates you can use immediately
- Expert guidance every step of the way
- Results you can measure from day one

**Why wait?** Every day without ${t} is a day of missed opportunity. Join the ${aud} who've already transformed their approach.

### Call to Action
[Get Started Now] — Limited spots available

### Guarantee
Try it risk-free for 30 days. If ${t} doesn't work for you, we'll refund every penny.`,

    'Product description': (t, aud, tn) => `${capitalize(t)}

Meet ${t} — the ${tn} choice for ${aud} who demand quality and performance.

**Features:**
• Premium design built to last
• Intuitive and easy to use
• Optimized for ${aud}
• Backed by expert support

**Benefits:**
✓ Save time with streamlined workflows
✓ Reduce costs with efficient design
✓ Improve results with proven methodology
✓ Enjoy peace of mind with full warranty

**Specifications:**
- Category: ${t}
- Target: ${aud}
- Style: ${tn}
- Availability: In stock

${capitalize(t)} is more than a product — it's a solution designed to make ${aud} more productive, more creative, and more successful. Order yours today.`,

    'Report': (t, aud, tn) => `# Report: ${capitalize(t)}

**Prepared for:** ${aud}
**Date:** ${new Date().toLocaleDateString()}
**Status:** Final

## Executive Summary

This report examines ${t} and its implications for ${aud}. Through careful analysis, we've identified key findings and recommendations that can guide decision-making and strategic planning.

## 1. Introduction

The purpose of this report is to provide a comprehensive overview of ${t}, including current status, challenges, opportunities, and recommended actions.

## 2. Methodology

Our analysis combines quantitative data review with qualitative assessment, focusing on factors most relevant to ${aud}.

## 3. Key Findings

### Finding 1: Current State
${capitalize(t)} is at a critical juncture. Current practices show both strengths and areas for improvement.

### Finding 2: Opportunities
Significant opportunities exist for ${aud} to leverage ${t} for competitive advantage.

### Finding 3: Risks
Key risks include resource constraints, implementation gaps, and market volatility.

## 4. Recommendations

1. Prioritize initiatives with highest impact
2. Allocate resources strategically
3. Establish clear metrics for success
4. Review progress quarterly

## 5. Conclusion

${capitalize(t)} presents both challenges and opportunities for ${aud}. With the right approach, the benefits far outweigh the risks.`,

    'Summary': (t, aud, tn) => `# Summary: ${capitalize(t)}

**Topic:** ${t}
**Audience:** ${aud}
**Tone:** ${tn}

## Overview

This summary covers the essential aspects of ${t}, distilling complex information into clear, actionable insights for ${aud}.

## Key Points

1. **Context** — ${capitalize(t)} plays a vital role in the current landscape for ${aud}.
2. **Core Elements** — Understanding the fundamentals of ${t} is critical for success.
3. **Impact** — The effects of ${t} extend across multiple areas, creating both challenges and opportunities.
4. **Action Items** — ${aud} should focus on practical steps to engage with ${t} effectively.

## Takeaway

${capitalize(t)} is a significant topic that warrants attention from ${aud}. By focusing on the core elements and taking measured action, meaningful progress is achievable.`,

    'Study content': (t, aud, tn) => `# Study Notes: ${capitalize(t)}

## Learning Objectives
- Understand the core concepts of ${t}
- Apply key principles in practical scenarios
- Evaluate different approaches to ${t}

## Key Definitions

**${capitalize(t)}**: The central concept that encompasses the methods, tools, and practices related to ${t}.

**${aud} context**: How ${aud} interact with and benefit from ${t} in real-world settings.

## Core Concepts

### 1. Fundamentals
${capitalize(t)} builds on foundational principles that every ${aud} should understand. These include basic terminology, common patterns, and standard practices.

### 2. Applications
Real-world applications of ${t} demonstrate its practical value. ${aud} can apply these concepts in various scenarios.

### 3. Advanced Topics
Building on the fundamentals, advanced aspects of ${t} require deeper study and practice.

## Review Questions
1. What is ${t} and why is it important for ${aud}?
2. Describe three key principles of ${t}.
3. How would you apply ${t} in a real scenario?
4. What are common challenges when working with ${t}?

## Summary
${capitalize(t)} is a multi-faceted topic with broad applications for ${aud}. Master the fundamentals, practice regularly, and apply concepts in context.`,
  };

  const template = templates[contentType] || templates['Blog post'];
  let content = template(topic, audience, tone);

  if (additional) {
    content += `\n\n## Additional Notes\n${additional}`;
  }

  if (language && language !== 'English') {
    content = `[Generated in ${language}]\n\n${content}`;
  }

  const words = content.split(/\s+/);
  if (words.length > wordCount * 1.5) {
    content = words.slice(0, Math.floor(wordCount * 1.5)).join(' ') + '...';
  }

  return content;
}

export async function refineText(
  current: string,
  action: 'improve' | 'shorten' | 'expand' | 'changeTone',
  tone?: string
): Promise<string> {
  await delay(800 + Math.random() * 600);

  switch (action) {
    case 'improve':
      return current
        .replace(/\bvery\b/gi, 'exceptionally')
        .replace(/\bgood\b/gi, 'excellent')
        .replace(/\bbig\b/gi, 'substantial')
        .replace(/\bthing\b/gi, 'element')
        .replace(/\. /g, '. ') + '\n\n[Refined for clarity, precision, and flow.]';

    case 'shorten':
      return current
        .split('\n\n')
        .slice(0, Math.ceil(current.split('\n\n').length * 0.6))
        .join('\n\n') + '\n\n[Condensed to essential points.]';

    case 'expand':
      return current
        .split('\n\n')
        .map((p) => p + "\n\nThis is an important consideration that deserves further attention. Let us explore the implications in more depth and consider how this affects the broader context.")
        .join('\n\n');

    case 'changeTone':
      return `[Tone adjusted to ${tone || 'professional'}]\n\n${current}`;
  }
}

// ─── Image Generation ─────────────────────────────────────────────

export interface ImageGenInput {
  prompt: string;
  style: string;
  aspectRatio: string;
  quality: string;
  count: number;
}

export interface GeneratedImage {
  url: string;
  seed: number;
  prompt: string;
  style: string;
}

export interface ImageGenResult {
  images: GeneratedImage[];
  optimizedPrompt: string;
  originalPrompt: string;
  model: string;
  spec: Record<string, unknown>;
}

export async function generateImages(input: ImageGenInput): Promise<ImageGenResult> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const apiUrl = `${supabaseUrl}/functions/v1/generate-image`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({
      prompt: input.prompt,
      style: input.style,
      aspectRatio: input.aspectRatio,
      quality: input.quality,
      count: input.count,
    }),
  });

  if (!response.ok) {
    let message = `Image generation failed (${response.status})`;
    try {
      const errorBody = await response.json();
      if (errorBody?.error) message = errorBody.error;
    } catch {
      // response body wasn't JSON; keep default message
    }
    throw new Error(message);
  }

  const data = await response.json();
  if (!data?.images || !Array.isArray(data.images) || data.images.length === 0) {
    throw new Error('Image generation failed. The image service returned no images. Please try again.');
  }

  const images: GeneratedImage[] = data.images.map(
    (img: { url: string; seed: number }) => ({
      url: img.url,
      seed: img.seed,
      prompt: input.prompt,
      style: input.style,
    })
  );

  return {
    images,
    optimizedPrompt: data.optimizedPrompt || '',
    originalPrompt: data.originalPrompt || input.prompt,
    model: data.model || 'pollinations-flux',
    spec: data.spec || {},
  };
}

// ─── Code Generation ──────────────────────────────────────────────

export interface CodeGenInput {
  language: string;
  framework: string;
  task: string;
  requirements: string;
  complexity: string;
}

export async function generateCode(input: CodeGenInput): Promise<string> {
  await delay(1000 + Math.random() * 800);

  const { language, framework, task, requirements, complexity } = input;
  const templates = getCodeTemplates(language, framework, task, requirements, complexity);
  return templates;
}

function getCodeTemplates(
  language: string,
  framework: string,
  task: string,
  requirements: string,
  complexity: string
): string {
  const t = task.toLowerCase();

  if (language === 'JavaScript' || language === 'TypeScript') {
    if (framework === 'React' || framework === 'Next.js') {
      const isTs = language === 'TypeScript';
      return isTs
        ? `import React, { useState, useCallback } from 'react';

interface ${toPascal(task)}Props {
  title?: string;
  onSubmit?: (data: Record<string, unknown>) => void;
}

export default function ${toPascal(task)}({ title = '${capitalize(task)}', onSubmit }: ${toPascal(task)}Props) {
  const [input, setInput] = useState('');
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    try {
      const newItem = input.trim();
      setItems((prev) => [...prev, newItem]);
      setInput('');
      onSubmit?.({ item: newItem });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [input, onSubmit]);

  const handleDelete = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter item..." className="flex-1 px-4 py-2 border rounded-lg" disabled={loading} />
        <button type="submit" disabled={loading || !input.trim()} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">{loading ? 'Adding...' : 'Add'}</button>
      </form>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span>{item}</span>
            <button onClick={() => handleDelete(index)} className="text-red-500 hover:text-red-700">Delete</button>
          </li>
        ))}
      </ul>
      {items.length === 0 && <p className="text-gray-500 text-center py-8">No items yet. Add one above.</p>}
    </div>
  );
}`
        : `import React, { useState, useCallback } from 'react';

export default function ${toPascal(task)}({ title = '${capitalize(task)}', onSubmit }) {
  const [input, setInput] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    try {
      const newItem = input.trim();
      setItems((prev) => [...prev, newItem]);
      setInput('');
      if (onSubmit) onSubmit({ item: newItem });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [input, onSubmit]);

  const handleDelete = useCallback((index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter item..." className="flex-1 px-4 py-2 border rounded-lg" disabled={loading} />
        <button type="submit" disabled={loading || !input.trim()} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">{loading ? 'Adding...' : 'Add'}</button>
      </form>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span>{item}</span>
            <button onClick={() => handleDelete(index)} className="text-red-500">Delete</button>
          </li>
        ))}
      </ul>
      {items.length === 0 && <p className="text-gray-500 text-center py-8">No items yet.</p>}
    </div>
  );
}`;
    }

    if (framework === 'Node.js') {
      return `const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let items = [];
let nextId = 1;

app.get('/api/items', (req, res) => {
  res.json({ success: true, data: items, count: items.length });
});

app.get('/api/items/:id', (req, res) => {
  const item = items.find(i => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ success: false, error: 'Item not found' });
  res.json({ success: true, data: item });
});

app.post('/api/items', (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ success: false, error: 'Name required' });
  const item = { id: nextId++, name, description: description || '' };
  items.push(item);
  res.status(201).json({ success: true, data: item });
});

app.put('/api/items/:id', (req, res) => {
  const item = items.find(i => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ success: false, error: 'Not found' });
  Object.assign(item, req.body);
  res.json({ success: true, data: item });
});

app.delete('/api/items/:id', (req, res) => {
  const index = items.findIndex(i => i.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, error: 'Not found' });
  items.splice(index, 1);
  res.json({ success: true, message: 'Deleted' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`;
    }
  }

  if (language === 'Python') {
    if (framework === 'Django') {
      return `from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

class ${toPascal(task)}Item:
    def __init__(self, id, name, description=''):
        self.id = id
        self.name = name
        self.description = description

_items = {}
_next_id = 1

def index(request):
    items = list(_items.values())
    return render(request, 'index.html', {'items': items})

@csrf_exempt
def api_items(request):
    global _next_id
    if request.method == 'GET':
        items = [{'id': v.id, 'name': v.name, 'description': v.description} for v in _items.values()]
        return JsonResponse({'success': True, 'data': items})
    elif request.method == 'POST':
        data = json.loads(request.body)
        name = data.get('name')
        if not name:
            return JsonResponse({'success': False, 'error': 'Name required'}, status=400)
        item = ${toPascal(task)}Item(_next_id, name, data.get('description', ''))
        _items[_next_id] = item
        _next_id += 1
        return JsonResponse({'success': True, 'data': {'id': item.id, 'name': item.name}}, status=201)
    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)`;
    }

    return `"""${capitalize(task)} - Python Implementation"""

from dataclasses import dataclass
from typing import Optional, List
import json

@dataclass
class ${toPascal(task)}Item:
    id: int
    name: str
    description: str = ""

class ${toPascal(task)}Manager:
    """Manager for ${task} operations."""
    def __init__(self) -> None:
        self._items: dict[int, ${toPascal(task)}Item] = {}
        self._next_id: int = 1

    def create(self, name: str, description: str = "") -> ${toPascal(task)}Item:
        if not name:
            raise ValueError("Name is required")
        item = ${toPascal(task)}Item(self._next_id, name, description)
        self._items[self._next_id] = item
        self._next_id += 1
        return item

    def get_all(self) -> List[${toPascal(task)}Item]:
        return list(self._items.values())

    def get_by_id(self, item_id: int) -> Optional[${toPascal(task)}Item]:
        return self._items.get(item_id)

    def update(self, item_id: int, **kwargs) -> Optional[${toPascal(task)}Item]:
        item = self._items.get(item_id)
        if not item:
            return None
        for key, value in kwargs.items():
            if hasattr(item, key):
                setattr(item, key, value)
        return item

    def delete(self, item_id: int) -> bool:
        if item_id in self._items:
            del self._items[item_id]
            return True
        return False

if __name__ == "__main__":
    manager = ${toPascal(task)}Manager()
    item1 = manager.create("First item", "Test description")
    item2 = manager.create("Second item")
    print(f"Created {len(manager.get_all())} items")`;
  }

  if (language === 'SQL') {
    return `-- ${capitalize(task)} Database Schema
CREATE TABLE IF NOT EXISTS ${toSnake(task)} (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_${toSnake(task)}_status ON ${toSnake(task)}(status);

INSERT INTO ${toSnake(task)} (name, description) VALUES
    ('Sample Item 1', 'First sample entry'),
    ('Sample Item 2', 'Second sample entry');

SELECT id, name, description, status, created_at
FROM ${toSnake(task)}
WHERE status = 'active'
ORDER BY created_at DESC;`;
  }

  if (language === 'Java') {
    return `import java.util.*;
import java.util.concurrent.*;

public class ${toPascal(task)} {
    private final Map<Integer, Item> items = new ConcurrentHashMap<>();
    private final AtomicInteger nextId = new AtomicInteger(1);

    public static class Item {
        private final int id;
        private String name;
        private String description;

        public Item(int id, String name, String description) {
            this.id = id;
            this.name = name;
            this.description = description;
        }

        public int getId() { return id; }
        public String getName() { return name; }
        public String getDescription() { return description; }
        public void setName(String name) { this.name = name; }
        public void setDescription(String desc) { this.description = desc; }
    }

    public Item create(String name, String description) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Name is required");
        }
        int id = nextId.getAndIncrement();
        Item item = new Item(id, name, description);
        items.put(id, item);
        return item;
    }

    public List<Item> getAll() {
        return new ArrayList<>(items.values());
    }

    public Optional<Item> getById(int id) {
        return Optional.ofNullable(items.get(id));
    }

    public boolean delete(int id) {
        return items.remove(id) != null;
    }

    public static void main(String[] args) {
        ${toPascal(task)} manager = new ${toPascal(task)}();
        manager.create("First", "Test item 1");
        manager.create("Second", "Test item 2");
        System.out.println("All items: " + manager.getAll());
    }
}`;
  }

  if (language === 'C#') {
    return `using System;
using System.Collections.Generic;
using System.Linq;

namespace ${toPascal(task)}App
{
    public class ${toPascal(task)}Item
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class ${toPascal(task)}Manager
    {
        private readonly Dictionary<int, ${toPascal(task)}Item> _items = new();
        private int _nextId = 1;

        public ${toPascal(task)}Item Create(string name, string description = "")
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Name is required");
            var item = new ${toPascal(task)}Item { Id = _nextId++, Name = name, Description = description };
            _items[item.Id] = item;
            return item;
        }

        public List<${toPascal(task)}Item> GetAll() => _items.Values.ToList();

        public ${toPascal(task)}Item? GetById(int id) =>
            _items.TryGetValue(id, out var item) ? item : null;

        public bool Delete(int id) => _items.Remove(id);
    }

    class Program
    {
        static void Main(string[] args)
        {
            var manager = new ${toPascal(task)}Manager();
            manager.Create("First", "Test item");
            manager.Create("Second");
            foreach (var item in manager.GetAll())
                Console.WriteLine($"[{item.Id}] {item.Name}: {item.Description}");
        }
    }
}`;
  }

  if (language === 'HTML') {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${capitalize(task)}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f5f5f5; padding: 2rem; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { margin-bottom: 1rem; color: #2563eb; }
        .card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        input, button { padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid #ddd; font-size: 1rem; }
        button { background: #2563eb; color: white; border: none; cursor: pointer; }
        button:hover { background: #1d4ed8; }
        .row { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
        .row input { flex: 1; }
        ul { list-style: none; }
        li { padding: 0.75rem; background: #f9fafb; border-radius: 8px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${capitalize(task)}</h1>
        <div class="card">
            <div class="row">
                <input type="text" id="input" placeholder="Enter item..." />
                <button onclick="addItem()">Add</button>
            </div>
            <ul id="list"></ul>
        </div>
    </div>
    <script>
        let items = [];
        function addItem() {
            const input = document.getElementById('input');
            if (!input.value.trim()) return;
            items.push(input.value.trim());
            input.value = '';
            render();
        }
        function deleteItem(i) { items.splice(i, 1); render(); }
        function render() {
            const list = document.getElementById('list');
            list.innerHTML = items.map((item, i) =>
                '<li>' + item + ' <button onclick="deleteItem(' + i + ')">Delete</button></li>'
            ).join('');
        }
    </script>
</body>
</html>`;
  }

  if (language === 'CSS') {
    return `/* ${capitalize(task)} Stylesheet */
:root {
  --primary: #2563eb;
  --bg: #f5f5f5;
  --card-bg: #ffffff;
  --text: #333333;
  --border: #e5e7eb;
  --radius: 12px;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  padding: 2rem;
}

.container { max-width: 800px; margin: 0 auto; }
h1 { color: var(--primary); margin-bottom: 1rem; font-size: 1.75rem; }
.card { background: var(--card-bg); border-radius: var(--radius); padding: 1.5rem; box-shadow: var(--shadow); }

input, button {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  font-size: 1rem;
  transition: all 0.2s ease;
}

input:focus { outline: none; border-color: var(--primary); }
button { background: var(--primary); color: white; border: none; cursor: pointer; }
button:hover { background: #1d4ed8; transform: translateY(-1px); }

@media (max-width: 640px) {
  body { padding: 1rem; }
  .card { padding: 1rem; }
}`;
  }

  if (language === 'Kotlin') {
    return `data class ${toPascal(task)}Item(
    val id: Int,
    val name: String,
    val description: String = ""
)

class ${toPascal(task)}Manager {
    private val items = mutableMapOf<Int, ${toPascal(task)}Item>()
    private var nextId = 1

    fun create(name: String, description: String = ""): ${toPascal(task)}Item {
        require(name.isNotBlank()) { "Name is required" }
        val item = ${toPascal(task)}Item(nextId++, name, description)
        items[item.id] = item
        return item
    }

    fun getAll(): List<${toPascal(task)}Item> = items.values.toList()
    fun getById(id: Int): ${toPascal(task)}Item? = items[id]
    fun delete(id: Int): Boolean = items.remove(id) != null
}

fun main() {
    val manager = ${toPascal(task)}Manager()
    manager.create("First", "Test item 1")
    manager.create("Second", "Test item 2")
    println("All items: \${manager.getAll()}")
}`;
  }

  return `// ${capitalize(task)} - ${language}
// Framework: ${framework}
// Complexity: ${complexity}
// Requirements: ${requirements}

function ${toCamel(task)}() {
  console.log('Implementing: ${task}');
  // TODO: Add implementation based on requirements
  // ${requirements}
}

${toCamel(task)}();`;
}

// ─── Prompt Optimization ───────────────────────────────────────────

export interface OptimizedPrompt {
  role: string;
  context: string;
  task: string;
  requirements: string[];
  constraints: string[];
  tone: string;
  outputFormat: string;
  full: string;
}

export async function optimizePrompt(original: string): Promise<OptimizedPrompt> {
  await delay(800 + Math.random() * 600);

  const role = 'Expert AI assistant specializing in content generation';
  const context = `The user wants to accomplish: "${original}". This requires understanding the goal, audience, and desired outcome.`;
  const task = `Generate a comprehensive response that addresses: ${original}`;
  const requirements = [
    'Provide clear, well-structured output',
    'Ensure accuracy and relevance to the request',
    'Use appropriate formatting for readability',
    'Include relevant examples where helpful',
    'Maintain consistency in tone and style',
  ];
  const constraints = [
    'Avoid unnecessary jargon',
    'Keep content focused and on-topic',
    'Respect the specified length requirements',
    'Do not include placeholder content',
  ];
  const tone = 'Professional, clear, and engaging';
  const outputFormat = 'Structured with headings, bullet points where appropriate, and a clear conclusion';

  const full = `## Role
${role}

## Context
${context}

## Task
${task}

## Requirements
${requirements.map((r) => `- ${r}`).join('\n')}

## Constraints
${constraints.map((c) => `- ${c}`).join('\n')}

## Tone
${tone}

## Output Format
${outputFormat}

---
Original prompt: "${original}"`;

  return { role, context, task, requirements, constraints, tone, outputFormat, full };
}

export async function generateFromPrompt(prompt: string): Promise<string> {
  await delay(1000 + Math.random() * 800);
  return `Based on your prompt: "${prompt}"

Here is a comprehensive response:

## Overview
This output addresses your request by breaking it down into clear, actionable components.

## Key Elements

1. **Analysis** — Your request has been analyzed to identify the core objectives.
2. **Implementation** — The approach ensures all aspects are addressed systematically.
3. **Results** — The output is structured to provide maximum value with clear takeaways.

## Conclusion
By using the optimized prompt, you receive more accurate, relevant, and well-structured output that directly addresses your needs.`;
}

// ─── Code Actions ──────────────────────────────────────────────────

export async function codeAction(
  code: string,
  action: 'explain' | 'fix' | 'optimize' | 'comment'
): Promise<string> {
  await delay(800 + Math.random() * 600);

  switch (action) {
    case 'explain':
      return `## Code Explanation

This code implements a solution with the following components:

**Structure Overview:**
The code is organized into logical sections — imports/dependencies, data models, core logic, and execution flow.

**Key Components:**

1. **Data Model** — Defines the structure of the data being handled.
2. **Manager/Controller** — Contains the business logic for CRUD operations.
3. **Error Handling** — Input validation ensures data integrity.
4. **Execution** — The main function demonstrates usage with sample data.

**Best Practices Used:**
- Type safety with proper typing
- Separation of concerns
- Input validation
- Clean, readable method names`;

    case 'fix':
      return code
        .replace(/console\.log\([^)]*\);?/g, '// Removed debug log')
        .replace(/var /g, 'const ')
        .replace(/== /g, '=== ')
        + '\n\n// Fixed: replaced var with const, == with ===, removed console.log statements';

    case 'optimize':
      return `// Optimized version\n${code}\n\n// Optimizations applied:\n// - Reduced redundant operations\n// - Improved variable scoping\n// - Enhanced error handling`;

    case 'comment':
      return code
        .split('\n')
        .map((line) => {
          if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim() === '') return line;
          if (line.includes('function') || line.includes('def ') || line.includes('class ')) {
            return line + ' // Main definition';
          }
          if (line.includes('return')) {
            return line + ' // Return result';
          }
          if (line.includes('if ') || line.includes('else')) {
            return line + ' // Conditional logic';
          }
          return line;
        })
        .join('\n');
  }
}

// ─── Helpers ───────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function toPascal(s: string): string {
  return s
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

function toCamel(s: string): string {
  const pascal = toPascal(s);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toSnake(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '_');
}

export type { GenerationType };
