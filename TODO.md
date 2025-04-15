1. authentication, cookies, sessions
 - client login/create account
 - saves client id in cookie
 - uses client id to get profile info, and when modifying orders

 2. courier login/create account
 - saves courier id in cookie
 - uses courier id to get courier info, and when modifying orders


3. accept/assign order flow
    
    - client creates (using profile location as pickup location, adds note)
    
    <STATUS = DRAFT>
    - created order
    - sets dropoff location on order
    - should be able to add pickup note on existing order
    - should be able to set date for pickup (after x time)

    <STATUS = PENDING>
    - after paying for order, waiting to be accepted by admin

    <STATUS = ACCEPTED>
    - admin accepts order, confirms date

    <STATUS = ASSIGNED_TO_COURIER>
        - admin assigns courier to order

    <STATUS = CONFIRMED_BY_COURIER>
        - courier accepts order
        - courier sees order in delivery list

    <STATUS = PICKED_UP>
        -courier picks up order

    <STATUS = DELIVERED>
        - courier delivers order
        - adds confirmation photo/text to order

    <STATUS = CANCELLED_BY_CLIENT>

    <STATUS = CANCELLED_BY_COURIER>
        -admin can reassign to new courier?

    <STATUS = CANCELLED_BY_ADMIN>




-- Potential issues

1. order is attached to user profile
- how does this work with multiple user locations?
- attach to user as well/instead?

2. who sets pickup/delivery date / time?

-- tech debt

1. need human-readable errors from backend (ex. profile duplicate email)
