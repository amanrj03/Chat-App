export type UserRow = {
  id: string
  email: string
  google_id: string
  name: string | null
  age: number | null
  gender: string | null
  mobile: string | null
  public_key: string | null
  created_at: string
}

export type ConversationRow = {
  id: string
  created_at: string
}

export type ConversationMemberRow = {
  conversation_id: string
  user_id: string
}

export type MessageRow = {
  id: string
  conversation_id: string
  sender_id: string
  ciphertext: string
  iv: string
  created_at: string
}
