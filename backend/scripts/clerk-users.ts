/**
 * Clerk User Management Script
 * 
 * This script helps you manage users in Clerk (list and delete)
 * 
 * Usage:
 *   npm run clerk:list     - List all users
 *   npm run clerk:delete <email>  - Delete user by email
 */

import { config } from 'dotenv';
config();

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const CLERK_API_URL = 'https://api.clerk.com/v1';

if (!CLERK_SECRET_KEY) {
  console.error('❌ CLERK_SECRET_KEY not found in .env file');
  process.exit(1);
}

async function listUsers() {
  try {
    const response = await fetch(`${CLERK_API_URL}/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Clerk API Error: ${JSON.stringify(error)}`);
    }

    const users = (await response.json()) as any[];
    
    console.log('\n📋 Clerk Users List:\n');
    console.log('═'.repeat(80));
    
    if (users.length === 0) {
      console.log('No users found.');
    } else {
      users.forEach((user: any, index: number) => {
        console.log(`\n${index + 1}. User ID: ${user.id}`);
        console.log(`   Name: ${user.first_name || ''} ${user.last_name || ''}`);
        console.log(`   Email: ${user.email_addresses?.[0]?.email_address || 'N/A'}`);
        console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
        console.log(`   Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}`);
      });
    }
    
    console.log('\n' + '═'.repeat(80));
    console.log(`\nTotal Users: ${users.length}\n`);
    
    return users;
  } catch (error) {
    console.error('❌ Error listing users:', error);
    throw error;
  }
}

async function deleteUserByEmail(email: string) {
  try {
    // First, get all users to find the one with matching email
    const response = await fetch(`${CLERK_API_URL}/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const users = (await response.json()) as any[];
    const user = users.find((u: any) => 
      u.email_addresses?.some((e: any) => e.email_address === email)
    );

    if (!user) {
      console.log(`❌ User with email "${email}" not found.`);
      return;
    }

    console.log(`\n🗑️  Deleting user: ${user.first_name || ''} ${user.last_name || ''} (${email})`);
    
    // Delete the user
    const deleteResponse = await fetch(`${CLERK_API_URL}/users/${user.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
      },
    });

    if (!deleteResponse.ok) {
      const error = await deleteResponse.json();
      throw new Error(`Failed to delete user: ${JSON.stringify(error)}`);
    }

    console.log(`✅ User deleted successfully!\n`);
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    throw error;
  }
}

async function deleteAllUsers() {
  try {
    const users = await listUsers();
    
    console.log('\n⚠️  WARNING: This will delete ALL users from Clerk!');
    console.log('Are you sure? (This is a destructive operation)\n');
    
    // In a real scenario, you'd want to add confirmation here
    // For now, we'll just list them
    
    console.log('To delete all users, uncomment the deletion code in the script.\n');
    
    // Uncomment below to actually delete all users
    /*
    for (const user of users) {
      const email = user.email_addresses?.[0]?.email_address;
      if (email) {
        await deleteUserByEmail(email);
      }
    }
    */
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Main execution
const command = process.argv[2];
const argument = process.argv[3];

(async () => {
  console.log('\n🔐 Clerk User Management Tool\n');
  
  try {
    switch (command) {
      case 'list':
        await listUsers();
        break;
      
      case 'delete':
        if (!argument) {
          console.error('❌ Please provide an email address to delete');
          console.log('Usage: npm run clerk:delete <email>');
          process.exit(1);
        }
        await deleteUserByEmail(argument);
        break;
      
      case 'delete-all':
        await deleteAllUsers();
        break;
      
      default:
        console.log('Usage:');
        console.log('  npm run clerk:list              - List all users');
        console.log('  npm run clerk:delete <email>    - Delete user by email');
        console.log('  npm run clerk:delete-all        - Delete all users (use with caution!)');
        console.log('\nExample:');
        console.log('  npm run clerk:list');
        console.log('  npm run clerk:delete test@example.com\n');
    }
  } catch (error) {
    process.exit(1);
  }
})();
