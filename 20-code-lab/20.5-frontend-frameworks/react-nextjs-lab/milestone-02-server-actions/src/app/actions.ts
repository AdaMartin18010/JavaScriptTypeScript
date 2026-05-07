'use server';

export async function createTodo(formData: FormData) {
  const title = formData.get('title') as string;
  console.log('Server Action:', title);
  return { success: true, title };
}
