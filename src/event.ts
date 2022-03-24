/* eslint-disable prettier/prettier */
import * as core from "@actions/core"
import { context } from "@actions/github"

export function getCreatedTag(): string | null {
    if (context.eventName !== "create") {
        core.info(`The event name was not "create". It was "${context.eventName}"`)
        return null   
    }

    if (context.payload.ref_type !== "tag") {
        core.info(`The created reference was not "tag". It was "${context.payload.ref_type}"`)
        return null
    }

    return context.payload.ref
}