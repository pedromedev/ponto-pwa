import { create } from "zustand"

type LoginStore = {
    email: string,
    password: string,
    isSubmitting: boolean,
    error: string | null

    setEmail: (email: string) => void,
    setPassword: (password: string) => void
    setError: (error: string | null) => void
    setSubmitting: (isSubmitting: boolean) => void
    clearForm: () => void,
}

export const useLoginFormStore = create<LoginStore>((set) => ({
    email: '',
    password: '',
    error: null,
    isSubmitting: false,

    setEmail: (email: string) => set({email: email}),
    setPassword: (password: string) => set({password: password}),
    setError: (error: string | null) => set({error: error}),
    setSubmitting: (isSubmitting: boolean) => set({isSubmitting: isSubmitting}),
    clearForm: () => {
        set({email: "", password: "", isSubmitting: false, error: null})
    }
}))