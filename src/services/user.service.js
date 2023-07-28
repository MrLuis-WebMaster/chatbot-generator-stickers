const { PrismaClient } = require('@prisma/client')

class UserService {
    prisma = new PrismaClient()
    async createUser (data) {
        const user = await this.prisma.user.findUnique({
            where: {
                number: data.from,
            },
        })
        if (user) return
        await this.prisma.user.create({
            data: {
                number: data.from
            }
        })
    }

}

module.exports = UserService;