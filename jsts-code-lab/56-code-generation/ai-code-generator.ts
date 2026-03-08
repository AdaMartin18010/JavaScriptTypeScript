/**
 * @file AI代码生成器
 * @category Code Generation → AI Generation
 * @difficulty medium
 * @tags code-generation, ai-coding, automation
 */

export interface CodeTemplate {
  language: string;
  framework?: string;
  pattern: string;
}

export class AICodeGenerator {
  private templates: Map<string, string> = new Map();
  
  constructor() {
    this.initializeTemplates();
  }
  
  private initializeTemplates(): void {
    this.templates.set('react-component', `
import React from 'react';

export interface {{ComponentName}}Props {
  {{props}}
}

export const {{ComponentName}}: React.FC<{{ComponentName}}Props> = (props) => {
  return (
    <div className="{{componentName}}">
      {/* Component content */}
    </div>
  );
};
`);
    
    this.templates.set('api-endpoint', `
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== '{{method}}') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Handler logic
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
`);
  }
  
  generate(templateName: string, variables: Record<string, string>): string {
    let template = this.templates.get(templateName) || '';
    
    for (const [key, value] of Object.entries(variables)) {
      template = template.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    
    return template;
  }
  
  // 从自然语言描述生成组件
  async generateFromDescription(description: string): Promise<string> {
    // 解析意图
    const intent = this.parseIntent(description);
    
    if (intent.type === 'component') {
      return this.generate('react-component', {
        ComponentName: intent.name,
        componentName: intent.name.toLowerCase(),
        props: this.generateProps(intent.features)
      });
    }
    
    if (intent.type === 'api') {
      return this.generate('api-endpoint', {
        method: intent.method || 'GET'
      });
    }
    
    return '// Could not generate code from description';
  }
  
  private parseIntent(description: string): {
    type: 'component' | 'api' | 'unknown';
    name: string;
    features: string[];
    method?: string;
  } {
    const lower = description.toLowerCase();
    
    if (lower.includes('组件') || lower.includes('component')) {
      const nameMatch = description.match(/(\w+)\s*(组件|component)?/i);
      return {
        type: 'component',
        name: nameMatch ? nameMatch[1] : 'MyComponent',
        features: this.extractFeatures(lower)
      };
    }
    
    if (lower.includes('api') || lower.includes('接口')) {
      return {
        type: 'api',
        name: 'handler',
        features: [],
        method: lower.includes('post') ? 'POST' : 'GET'
      };
    }
    
    return { type: 'unknown', name: 'Unknown', features: [] };
  }
  
  private extractFeatures(description: string): string[] {
    const features: string[] = [];
    if (description.includes('表单')) features.push('form');
    if (description.includes('列表')) features.push('list');
    if (description.includes('搜索')) features.push('search');
    return features;
  }
  
  private generateProps(features: string[]): string {
    const props: string[] = ['title?: string'];
    if (features.includes('form')) props.push('onSubmit?: (data: any) => void');
    if (features.includes('list')) props.push('items?: any[]');
    return props.join(';\n  ');
  }
}

export async function demo(): Promise<void> {
  console.log('=== AI代码生成 ===\n');
  
  const generator = new AICodeGenerator();
  
  const component = await generator.generateFromDescription('创建一个UserList用户列表组件');
  console.log('生成的组件代码:');
  console.log(component.slice(0, 300) + '...');
}
