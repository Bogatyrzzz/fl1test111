import { supabaseAdmin } from './supabase'

// Helper функция для генерации UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
interface User {
  id: string
  email?: string
  fullName?: string
  password?: string
  emailVerified?: boolean
  verificationCode?: string
  verificationCodeExpires?: Date
  createdAt?: Date
  updatedAt?: Date
}

interface Calculation {
  id: string
  userId: string
  type: string
  title: string
  inputData?: string
  resultData?: string
  status?: string
  errorMessage?: string
  createdAt?: Date
  updatedAt?: Date
}

// Обертка для работы с пользователями
export const db = {
  // Работа с пользователями
  user: {
    findUnique: async ({ where }: { where: { id?: string; email?: string } }) => {
      let query = supabaseAdmin.from('users').select('*')
      
      if (where.id) {
        query = query.eq('id', where.id)
      }
      if (where.email) {
        query = query.eq('email', where.email)
      }
      
      const { data, error } = await query.single()
      
      if (error || !data) return null
      
      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        password: data.password,
        emailVerified: data.email_verified,
        verificationCode: data.verification_code,
        verificationCodeExpires: data.verification_code_expires ? new Date(data.verification_code_expires) : undefined,
        createdAt: data.created_at ? new Date(data.created_at) : undefined,
        updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
      }
    },
    
    create: async ({ data }: { data: Omit<User, 'id' | 'createdAt' | 'updatedAt'> }) => {
      const { data: result, error } = await supabaseAdmin
        .from('users')
        .insert({
          id: generateUUID(),
          email: data.email,
          full_name: data.fullName,
          password: data.password,
          email_verified: data.emailVerified || false,
          verification_code: data.verificationCode,
          verification_code_expires: data.verificationCodeExpires?.toISOString(),
        })
        .select()
        .single()
      
      if (error || !result) throw error
      
      return {
        id: result.id,
        email: result.email,
        fullName: result.full_name,
        password: result.password,
        emailVerified: result.email_verified,
        verificationCode: result.verification_code,
        verificationCodeExpires: result.verification_code_expires ? new Date(result.verification_code_expires) : undefined,
        createdAt: result.created_at ? new Date(result.created_at) : undefined,
        updatedAt: result.updated_at ? new Date(result.updated_at) : undefined,
      }
    },
    
    update: async ({ where, data }: { where: { id: string }; data: Partial<User> }) => {
      const updateData: any = {}
      
      if (data.email !== undefined) updateData.email = data.email
      if (data.fullName !== undefined) updateData.full_name = data.fullName
      if (data.password !== undefined) updateData.password = data.password
      if (data.emailVerified !== undefined) updateData.email_verified = data.emailVerified
      if (data.verificationCode !== undefined) updateData.verification_code = data.verificationCode
      if (data.verificationCodeExpires !== undefined) updateData.verification_code_expires = data.verificationCodeExpires ? data.verificationCodeExpires.toISOString() : null
      
      const { data: result, error } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', where.id)
        .select()
        .single()
      
      if (error || !result) throw error
      
      return {
        id: result.id,
        email: result.email,
        fullName: result.full_name,
        password: result.password,
        emailVerified: result.email_verified,
        verificationCode: result.verification_code,
        verificationCodeExpires: result.verification_code_expires ? new Date(result.verification_code_expires) : undefined,
        createdAt: result.created_at ? new Date(result.created_at) : undefined,
        updatedAt: result.updated_at ? new Date(result.updated_at) : undefined,
      }
    }
  },
  
  // Работа с расчетами
  calculation: {
    findMany: async ({ where, orderBy, take }: { 
      where?: { userId?: string; type?: string }
      orderBy?: { createdAt?: 'desc' | 'asc' }
      take?: number 
    }) => {
      let query = supabaseAdmin.from('calculations').select('*')
      
      if (where?.userId) query = query.eq('user_id', where.userId)
      if (where?.type) query = query.eq('type', where.type)
      if (orderBy?.createdAt) query = query.order('created_at', { ascending: orderBy.createdAt === 'asc' })
      if (take) query = query.limit(take)
      
      const { data, error } = await query
      
      if (error) throw error
      
      return data?.map(item => ({
        id: item.id,
        userId: item.user_id,
        type: item.type,
        title: item.title,
        inputData: item.input_data,
        resultData: item.result_data,
        status: item.status,
        errorMessage: item.error_message,
        createdAt: item.created_at ? new Date(item.created_at) : undefined,
        updatedAt: item.updated_at ? new Date(item.updated_at) : undefined,
      })) || []
    },
    
    create: async ({ data }: { data: Omit<Calculation, 'id' | 'createdAt' | 'updatedAt'> }) => {
      const { data: result, error } = await supabaseAdmin
        .from('calculations')
        .insert({
          id: generateUUID(),
          user_id: data.userId,
          type: data.type,
          title: data.title,
          input_data: data.inputData,
          result_data: data.resultData,
          status: data.status || 'completed',
          error_message: data.errorMessage,
        })
        .select()
        .single()
      
      if (error || !result) throw error
      
      return {
        id: result.id,
        userId: result.user_id,
        type: result.type,
        title: result.title,
        inputData: result.input_data,
        resultData: result.result_data,
        status: result.status,
        errorMessage: result.error_message,
        createdAt: result.created_at ? new Date(result.created_at) : undefined,
        updatedAt: result.updated_at ? new Date(result.updated_at) : undefined,
      }
    },
    
    count: async ({ where }: { where?: { userId?: string; type?: string } }) => {
      let query = supabaseAdmin.from('calculations').select('*', { count: 'exact', head: true })
      
      if (where?.userId) query = query.eq('user_id', where.userId)
      if (where?.type) query = query.eq('type', where.type)
      
      const { count, error } = await query
      
      if (error) throw error
      
      return count || 0
    },
    
    delete: async ({ where }: { where: { userId: string } }) => {
      const { error } = await supabaseAdmin
        .from('calculations')
        .delete()
        .eq('user_id', where.userId)
      
      if (error) throw error
      
      return { count: 1 }
    },
    
    update: async ({ where, data }: { where: { id: string }; data: Partial<Calculation> }) => {
      const updateData: any = {}
      
      if (data.title !== undefined) updateData.title = data.title
      if (data.inputData !== undefined) updateData.input_data = data.inputData
      if (data.resultData !== undefined) updateData.result_data = data.resultData
      if (data.status !== undefined) updateData.status = data.status
      if (data.errorMessage !== undefined) updateData.error_message = data.errorMessage
      
      const { data: result, error } = await supabaseAdmin
        .from('calculations')
        .update(updateData)
        .eq('id', where.id)
        .select()
        .single()
      
      if (error) {
        console.error('Supabase update error:', error)
        throw error
      }
      
      if (!result) {
        throw new Error('Calculation not found')
      }
      
      return {
        id: result.id,
        userId: result.user_id,
        type: result.type,
        title: result.title,
        inputData: result.input_data,
        resultData: result.result_data,
        status: result.status,
        errorMessage: result.error_message,
        createdAt: result.created_at ? new Date(result.created_at) : undefined,
        updatedAt: result.updated_at ? new Date(result.updated_at) : undefined,
      }
    }
  }
}