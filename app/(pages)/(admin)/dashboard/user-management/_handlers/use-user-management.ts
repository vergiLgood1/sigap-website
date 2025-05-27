import { IUserFilterOptionsSchema, IUserSchema } from "@/src/entities/models/users/users.model"
import { useEffect, useState } from "react"

export const useUserManagementHandlers = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const [isDetailUser, setIsDetailUser] = useState<IUserSchema | null>(null)
    const [isUpdateUser, setIsUpdateUser] = useState<IUserSchema | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [isUpdateOpen, setIsUpdateOpen] = useState(false)

    // Filter states
    const [filters, setFilters] = useState<IUserFilterOptionsSchema>({
        email: "",
        phone: "",
        lastSignIn: "",
        createdAt: "",
        status: [],
    })

    // Handle opening the detail sheet
    const handleUserClick = (user: IUserSchema) => {
        setIsDetailUser(user)
        setIsSheetOpen(true)
    }

    // Handle opening the update sheet
    const handleUserUpdate = (user: IUserSchema) => {
        setIsUpdateUser(user)
        setIsUpdateOpen(true)
    }

    // Close detail sheet when update sheet opens
    useEffect(() => {
        if (isUpdateOpen) {
            setIsSheetOpen(false)
        }
    }, [isUpdateOpen])

    // Reset detail user when sheet closes
    useEffect(() => {
        if (!isSheetOpen) {
            // Use a small delay to prevent flickering if another sheet is opening
            const timer = setTimeout(() => {
                if (!isSheetOpen && !isUpdateOpen) {
                    setIsDetailUser(null)
                }
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [isSheetOpen, isUpdateOpen])

    // Reset update user when update sheet closes
    useEffect(() => {
        if (!isUpdateOpen) {
            // Use a small delay to prevent flickering if another sheet is opening
            const timer = setTimeout(() => {
                if (!isUpdateOpen) {
                    setIsUpdateUser(null)
                }
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [isUpdateOpen])

    const clearFilters = () => {
        setFilters({
            email: "",
            phone: "",
            lastSignIn: "",
            createdAt: "",
            status: [],
        })
    }

    const getActiveFilterCount = () => {
        return Object.values(filters).filter(
            (value) => (typeof value === "string" && value !== "") || (Array.isArray(value) && value.length > 0),
        ).length
    }

    return {
        searchQuery,
        setSearchQuery,
        isDetailUser,
        isUpdateUser,
        isSheetOpen,
        setIsSheetOpen,
        isUpdateOpen,
        setIsUpdateOpen,
        filters,
        setFilters,
        handleUserClick,
        handleUserUpdate,
        clearFilters,
        getActiveFilterCount,
    }
}

export const filterUsers = (users: IUserSchema[], searchQuery: string, filters: IUserFilterOptionsSchema): IUserSchema[] => {
    return users.filter((user) => {

        // Global search
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            const matchesSearch =
                user.email?.toLowerCase().includes(query) ||
                user.phone?.toLowerCase().includes(query) ||
                user.id.toLowerCase().includes(query)

            if (!matchesSearch) return false
        }

        // Email filter
        if (filters.email && !user.email?.toLowerCase().includes(filters.email.toLowerCase())) {
            return false
        }

        // Phone filter
        if (filters.phone && !user.phone?.toLowerCase().includes(filters.phone.toLowerCase())) {
            return false
        }

        // Last sign in filter
        if (filters.lastSignIn) {
            if (filters.lastSignIn === "never" && user.last_sign_in_at) {
                return false
            } else if (filters.lastSignIn === "today") {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const signInDate = user.last_sign_in_at ? new Date(user.last_sign_in_at) : null
                if (!signInDate || signInDate < today) return false
            } else if (filters.lastSignIn === "week") {
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                const signInDate = user.last_sign_in_at ? new Date(user.last_sign_in_at) : null
                if (!signInDate || signInDate < weekAgo) return false
            } else if (filters.lastSignIn === "month") {
                const monthAgo = new Date()
                monthAgo.setMonth(monthAgo.getMonth() - 1)
                const signInDate = user.last_sign_in_at ? new Date(user.last_sign_in_at) : null
                if (!signInDate || signInDate < monthAgo) return false
            }
        }

        // Created at filter
        if (filters.createdAt) {
            if (filters.createdAt === "today") {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const createdAt = user.created_at ? (user.created_at ? new Date(user.created_at) : new Date()) : new Date()
                if (createdAt < today) return false
            } else if (filters.createdAt === "week") {
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                const createdAt = user.created_at ? new Date(user.created_at) : new Date()
                if (createdAt < weekAgo) return false
            } else if (filters.createdAt === "month") {
                const monthAgo = new Date()
                monthAgo.setMonth(monthAgo.getMonth() - 1)
                const createdAt = user.created_at ? new Date(user.created_at) : new Date()
                if (createdAt < monthAgo) return false
            }
        }

        // Status filter
        if (filters.status.length > 0) {
            const userStatus = user.banned_until ? "banned" : !user.email_confirmed_at ? "unconfirmed" : "active"

            if (!filters.status.includes(userStatus)) {
                return false
            }
        }

        return true
    })
}