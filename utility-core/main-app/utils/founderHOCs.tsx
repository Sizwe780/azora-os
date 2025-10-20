import { type ComponentType } from 'react';
import { getFounderById, type Founder } from '../types/founders';

type WithUserProps = {
  userId?: string;
} & Record<string, unknown>;

export function withUser<P extends WithUserProps>(
  Component: ComponentType<P>,
  defaultUserId: string = 'user_001'
): ComponentType<Omit<P, 'userId'> & { userId?: string }> {
  const WithUserComponent = (props: Omit<P, 'userId'> & { userId?: string }) => {
    const userId = props.userId ?? defaultUserId;
    const enhancedProps = { ...props, userId } as P;

    return <Component {...enhancedProps} />;
  };

  WithUserComponent.displayName = `WithUser(${Component.displayName ?? Component.name ?? 'Component'})`;

  return WithUserComponent;
}

export function withFounderData<P extends WithUserProps>(
  Component: ComponentType<P & { founder: Founder }>
): ComponentType<Omit<P, 'founder'> & { userId?: string }> {
  const WithFounderDataComponent = (props: Omit<P, 'founder'> & { userId?: string }) => {
    const userId = props.userId ?? 'user_001';
    const founder = getFounderById(userId);

    if (!founder) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-8">
            <p className="text-red-900 dark:text-red-400 font-semibold">Founder not found</p>
          </div>
        </div>
      );
    }

    const enhancedProps = { ...props, founder } as P & { founder: Founder };

    return <Component {...enhancedProps} />;
  };

  WithFounderDataComponent.displayName = `WithFounderData(${Component.displayName ?? Component.name ?? 'Component'})`;

  return WithFounderDataComponent;
}
