import prisma from '@/lib/prisma'

const authSeller = async (userId) => {
    try {
        const store = await prisma.store.findUnique({
            where: { userId },
        })

        if (store && store.status === 'approved') {
            return store.id
        }

        return false
    } catch (error) {
        console.error(error)
        return false
    }
}

export default authSeller