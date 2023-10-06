const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

class UserService {
    prisma = new PrismaClient()
    async createUser (msg, client) {
        const user = await this.prisma.user.findUnique({
            where: {
                number: msg.from,
            },
        })
        if (user) return
        await this.prisma.user.create({
            data: {
                number: msg.from
            }
        })
        await client.sendMessage(
            msg.from,
            `Hello! We inform you that by interacting with our bot, you are implicitly accepting our privacy policies. You can review them at ${process.env.LINK_PRIVACY || ''}`
        );
    }
    async totalUsers () {
        const userCount = await this.prisma.user.count();
        return userCount;
    }
}

module.exports = UserService;